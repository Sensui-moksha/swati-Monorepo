# ==============================================================================
# Monorepo Multi-Stage Dockerfile (Coolify & Production Deployments)
# Default Target: frontend (swati-clientside)
# Alternate Target: backend (--target backend)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Builder (TanStack Start / Vite)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Build arguments provided by Coolify / CI
ARG VITE_API_URL
ARG COOLIFY_URL
ARG COOLIFY_FQDN
ARG COOLIFY_BRANCH
ARG COOLIFY_RESOURCE_UUID

ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package descriptors and install dependencies
COPY swati-clientside/package*.json ./
RUN npm install

# Copy frontend source code and build production assets
COPY swati-clientside/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Frontend Production Runner (Default for Coolify frontend deployments)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Copy necessary production artifacts
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/vite.config.ts ./vite.config.ts
COPY --from=frontend-builder /app/tsconfig.json ./tsconfig.json

# Serve application in production preview mode
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]

# ------------------------------------------------------------------------------
# Stage 3: Backend Builder (Express + TypeScript API Server)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json backend/tsconfig*.json ./
RUN npm ci

COPY backend/src/ ./src/
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Backend Production Runner (--target backend)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /usr/src/app/dist ./dist

USER node
EXPOSE 3000

CMD ["node", "dist/app.js"]

# ------------------------------------------------------------------------------
# Default Final Target
# (Ensures un-targeted 'docker build -f Dockerfile .' builds the frontend)
# ------------------------------------------------------------------------------
FROM frontend AS final
