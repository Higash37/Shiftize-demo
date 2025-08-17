# 🐳 Docker Documentation for Shiftize

## 📋 Overview

This document provides comprehensive instructions for running Shiftize using Docker containers. Shiftize is an enterprise-grade shift scheduling application built with React Native Web and Firebase.

## 🏗️ Architecture

- **Frontend**: React Native Web (Expo)
- **Backend**: Firebase Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Containerization**: Docker with Nginx

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Node.js 20+ (for development)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Higash37/Shiftize.git
cd shift-scheduler-app
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application Configuration
NODE_ENV=production
APP_PORT=3000
APP_HOST=0.0.0.0
```

### 3. Build and Run

#### Option A: Using Docker Compose (Recommended)

```bash
# Production deployment
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up -d
```

#### Option B: Using Docker directly

```bash
# Build the image
docker build -t shiftize:latest .

# Run the container
docker run -d -p 3000:80 --name shiftize-app shiftize:latest
```

### 4. Access the Application

- **Web Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/ (should return 200 OK)

## 📁 Docker Files Overview

### Dockerfile

Multi-stage production build:

1. **Base Stage**: Node.js 20 Alpine with system dependencies
2. **Dependencies Stage**: Install production dependencies
3. **Build Stage**: Install dev dependencies and build the app
4. **Production Stage**: Nginx with built app and optimized layers

Key features:
- ✅ Multi-stage build for minimal image size
- ✅ Production-optimized Nginx configuration
- ✅ Security headers and gzip compression
- ✅ Health checks included
- ✅ Proper caching layers

### Dockerfile.dev

Development-focused build:
- Hot reload support
- Expo development server
- Firebase emulators
- Development tools

### docker-compose.yml

Complete orchestration with:
- **shiftize-web**: Main application container
- **shiftize-dev**: Development server (profile: dev)
- **firebase-emulator**: Local Firebase services (profile: dev)
- **nginx-proxy**: Reverse proxy (profile: production)
- **redis**: Session storage (profile: cache)

## 🔧 Development Workflow

### Local Development with Docker

```bash
# Start development environment
docker-compose --profile dev up

# View logs
docker-compose logs -f shiftize-dev

# Rebuild after changes
docker-compose build shiftize-dev
docker-compose up -d shiftize-dev
```

Access points:
- **Web App**: http://localhost:19006
- **Firebase UI**: http://localhost:4000
- **Expo DevTools**: http://localhost:19002

### Production Testing

```bash
# Build and start production container
docker-compose up -d shiftize-web

# Check application health
curl http://localhost:3000/

# View production logs
docker-compose logs -f shiftize-web
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   
   # Kill the process or use different port
   docker run -p 8080:80 shiftize:latest
   ```

2. **Build Failures**
   ```bash
   # Clear Docker cache
   docker builder prune -a
   
   # Rebuild without cache
   docker build --no-cache -t shiftize:latest .
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs container_name
   
   # Run interactive shell for debugging
   docker run -it shiftize:latest sh
   ```

4. **Firebase Connection Issues**
   ```bash
   # Verify environment variables
   docker exec container_name env | grep FIREBASE
   
   # Check Firebase configuration in logs
   docker logs container_name | grep -i firebase
   ```

### Memory and Performance

```bash
# Monitor container resources
docker stats

# Limit container memory
docker run -m 512m shiftize:latest

# Check image size
docker images shiftize
```

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**
   - Set all required Firebase credentials
   - Configure proper domain names
   - Set NODE_ENV=production

2. **SSL Configuration**
   ```bash
   # Add SSL certificates to ./ssl/ directory
   # Update nginx-proxy service in docker-compose.yml
   docker-compose --profile production up -d
   ```

3. **Monitoring**
   ```bash
   # Health check
   docker exec shiftize-web curl -f http://localhost/
   
   # Application logs
   docker-compose logs -f
   ```

### Container Registry

```bash
# Tag for registry
docker tag shiftize:latest your-registry.com/shiftize:v1.0.0

# Push to registry
docker push your-registry.com/shiftize:v1.0.0

# Deploy from registry
docker run -d -p 80:80 your-registry.com/shiftize:v1.0.0
```

## 🔐 Security Considerations

- ✅ Non-root user in containers
- ✅ Security headers in Nginx
- ✅ No sensitive data in images
- ✅ Minimal attack surface
- ✅ Regular base image updates

## 📊 Monitoring

### Health Checks

```bash
# Built-in health check
docker inspect --format='{{.State.Health.Status}}' container_name

# Manual health check
curl -f http://localhost:3000/ || echo "App is down"
```

### Logs

```bash
# Application logs
docker-compose logs -f shiftize-web

# System logs
docker-compose logs -f nginx-proxy

# Firebase logs (development)
docker-compose logs -f firebase-emulator
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Clean up old images
docker image prune -f
```

### Backup and Recovery

```bash
# Export container data
docker export container_name > backup.tar

# Backup volumes
docker run --rm -v shiftize_data:/data -v $(pwd):/backup alpine tar czf /backup/data.tar.gz /data
```

## 📞 Support

For issues related to:
- **Docker setup**: Check this documentation and Docker logs
- **Application bugs**: Create an issue in the GitHub repository  
- **Firebase configuration**: Verify environment variables and Firebase console

## 🏷️ Docker Image Information

- **Base Image**: node:20-alpine + nginx:alpine
- **Size**: ~150MB (optimized)
- **Ports**: 80 (HTTP), 3000 (application)
- **Health Check**: HTTP GET /
- **Restart Policy**: unless-stopped

---

🤖 Generated with [Claude Code](https://claude.ai/code)