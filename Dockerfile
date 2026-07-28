# Multistage Dockerfile for swati-clientside (TanStack Start / Vite)

# 1. Base stage (Node 22 required by @tanstack/react-start >= 22.12.0)
FROM node:22-alpine AS base
WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install

# 3. Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# 4. Production runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173
ENV HOST=0.0.0.0

EXPOSE 5173

# Copy runtime files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Start server in production preview mode
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
