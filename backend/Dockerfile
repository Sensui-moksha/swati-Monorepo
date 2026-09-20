# ---------------------------------------
# Stage 1: Build
# ---------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for node-gyp or specific packages if required
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including dev)
RUN npm install --include=dev

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# ---------------------------------------
# Stage 2: Production Dependencies
# ---------------------------------------
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
# Install only production dependencies
RUN npm install --omit=dev

# ---------------------------------------
# Stage 3: Production Image
# ---------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set Node environment to production
ENV NODE_ENV=production

# Copy necessary files from builder and deps
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json ./

# Run as non-root user
USER node

# Expose API port
EXPOSE 3000

# Start command
CMD ["node", "dist/app.js"]
