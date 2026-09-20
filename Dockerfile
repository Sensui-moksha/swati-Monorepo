# ==============================================================================
# Monorepo Multi-Stage Dockerfile (Coolify & Production Full-Stack Deployment)
# Serves both the Express API and Frontend UI via Backend Fallback on Port 3000
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (TanStack Start / Vite)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /app/swati-clientside

ARG VITE_API_URL
ARG COOLIFY_URL
ARG COOLIFY_FQDN
ARG COOLIFY_BRANCH
ARG COOLIFY_RESOURCE_UUID

ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY swati-clientside/package*.json ./
RUN npm install --include=dev

COPY swati-clientside/ ./
ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Backend (Express + TypeScript API)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package*.json backend/tsconfig*.json ./
RUN npm install --include=dev

COPY backend/src/ ./src/
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Unified Production Full-Stack Runner (Default Target)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_CLIENT_DIST=/app/swati-clientside/dist/client
ENV FRONTEND_SERVER_ENTRY=/app/swati-clientside/dist/server/server.js

# Install backend production dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy compiled frontend assets & SSR bundle
WORKDIR /app/swati-clientside
COPY --from=frontend-builder /app/swati-clientside/dist ./dist
COPY --from=frontend-builder /app/swati-clientside/public ./public
COPY --from=frontend-builder /app/swati-clientside/package*.json ./
COPY --from=frontend-builder /app/swati-clientside/node_modules ./node_modules

WORKDIR /app/backend
EXPOSE 3000

# Start backend serving API + Frontend fallback
CMD ["node", "dist/app.js"]

# ------------------------------------------------------------------------------
# Default Target: runner
# ------------------------------------------------------------------------------
FROM runner AS final
