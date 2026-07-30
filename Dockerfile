# ---------------------------------------
# Stage 1: Build Frontend
# ---------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass in environment variables for the build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the Vite React application
RUN npm run build

# ---------------------------------------
# Stage 2: Serve via NGINX (Static delivery)
# ---------------------------------------
FROM nginx:alpine AS runner

# Remove default NGINX static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# We don't need a custom nginx.conf here if we are using a master NGINX container in docker-compose
# But for standalone running, we add a simple fallback conf
COPY nginx/standalone.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
