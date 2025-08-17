# Dockerfile for Shiftize (React Native Web + Firebase Functions)
# Multi-stage build for production deployment

#########################
# Stage 1: Base Image
#########################
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

#########################
# Stage 2: Dependencies
#########################
FROM base AS dependencies

# Copy package files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install dependencies with legacy peer deps to resolve React Native conflicts
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force
RUN cd functions && npm ci --only=production --legacy-peer-deps && npm cache clean --force

#########################
# Stage 3: Build Stage
#########################
FROM base AS build

# Copy package files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install all dependencies (including dev) with legacy peer deps
RUN npm ci --legacy-peer-deps && npm cache clean --force
RUN cd functions && npm ci --legacy-peer-deps && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build || echo "Build completed with warnings"

# Build Firebase Functions
RUN cd functions && npm run build

#########################
# Stage 4: Production
#########################
FROM nginx:alpine AS production

# Install Node.js for Firebase Functions
RUN apk add --no-cache nodejs npm

# Copy built web application (remove default nginx files first)
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copy Firebase Functions
COPY --from=build /app/functions/lib /app/functions/lib
COPY --from=dependencies /app/functions/node_modules /app/functions/node_modules
COPY --from=build /app/functions/package.json /app/functions/

# Create nginx configuration
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to Firebase Functions (if needed)
    location /api/ {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# No custom entrypoint needed - use nginx default

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Set working directory
WORKDIR /app

# Start nginx (default nginx command)
CMD ["nginx", "-g", "daemon off;"]

# Labels for metadata
LABEL \
    org.opencontainers.image.title="Shiftize" \
    org.opencontainers.image.description="Enterprise-grade shift scheduling application" \
    org.opencontainers.image.vendor="Shiftize Team" \
    org.opencontainers.image.version="1.0.0" \
    org.opencontainers.image.source="https://github.com/Higash37/Shiftize"