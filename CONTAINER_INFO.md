# 🐳 Shiftize Docker Container Information

## 📊 Container Status (2025-08-17)

### ✅ Running Container

**Container Name**: `shiftize-app`

**Status**: 🟢 **RUNNING & HEALTHY**

```
Container ID: 0e4ea25de310
Image: shiftize:latest
Created: 2025-08-17 15:07:26 UTC
Status: Up (healthy)
Port Mapping: 0.0.0.0:3000->80/tcp
Restart Policy: unless-stopped
```

### 🌐 Access Information

- **Web Application**: http://localhost:3000
- **Health Check Endpoint**: http://localhost:3000/
- **Container Logs**: `docker logs shiftize-app`

### 💻 Resource Usage

```
CPU Usage: 0.00%
Memory Usage: 7.695 MiB / 7.612 GiB
Network I/O: 1.17kB / 126B
```

### 📦 Docker Image Details

```
Repository: shiftize
Tag: latest
Size: 179 MB
Created: 2025-08-18 00:04:17 JST
Base Images: nginx:alpine + node:20-alpine
```

## 🔧 Container Management Commands

### Start/Stop/Restart

```bash
# Stop container
docker stop shiftize-app

# Start container
docker start shiftize-app

# Restart container
docker restart shiftize-app

# Remove container (if needed)
docker stop shiftize-app && docker rm shiftize-app
```

### Monitoring

```bash
# View real-time logs
docker logs -f shiftize-app

# Check container status
docker ps --filter name=shiftize-app

# Monitor resource usage
docker stats shiftize-app

# Health check status
docker inspect shiftize-app --format='{{.State.Health.Status}}'
```

### Debugging

```bash
# Access container shell
docker exec -it shiftize-app sh

# Check nginx configuration
docker exec shiftize-app nginx -t

# View nginx access logs
docker exec shiftize-app cat /var/log/nginx/access.log

# View nginx error logs
docker exec shiftize-app cat /var/log/nginx/error.log
```

## 🚀 Deployment Instructions

### Re-deploy with New Changes

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild Docker image
docker build -t shiftize:latest .

# 3. Stop current container
docker stop shiftize-app

# 4. Remove old container
docker rm shiftize-app

# 5. Start new container
docker run -d --name shiftize-app -p 3000:80 --restart unless-stopped shiftize:latest

# 6. Verify deployment
docker ps --filter name=shiftize-app
curl -I http://localhost:3000
```

### Docker Compose Alternative

```bash
# Using docker-compose (if configured)
docker-compose down
docker-compose up -d
```

## 🔒 Security Notes

- ✅ Container runs with non-root user (nginx)
- ✅ Security headers configured (X-Frame-Options, XSS-Protection, etc.)
- ✅ Minimal attack surface (Alpine Linux base)
- ✅ No sensitive data in image layers
- ✅ Health checks enabled

## ⚠️ Important Notes

1. **Auto-Restart**: Container is configured with `--restart unless-stopped`, meaning it will automatically restart after system reboot unless manually stopped.

2. **Port 3000**: Make sure port 3000 is not used by other applications.

3. **Firebase Configuration**: Ensure Firebase environment variables are properly set if using Firebase features.

4. **Volume Mounts**: No persistent volumes are currently mounted. Application data is stored in Firebase.

## 📅 Maintenance Schedule

- **Daily**: Check container health status
- **Weekly**: Review container logs for errors
- **Monthly**: Update base images for security patches
- **Quarterly**: Full rebuild with dependency updates

## 🆘 Troubleshooting

If the container is not accessible:

1. Check if container is running: `docker ps`
2. Check container logs: `docker logs shiftize-app`
3. Verify port is available: `netstat -an | findstr :3000`
4. Test health endpoint: `curl http://localhost:3000/`
5. Restart container: `docker restart shiftize-app`

---

**Last Updated**: 2025-08-17 15:09:47 UTC
**Container Uptime**: Since 2025-08-17 15:07:26 UTC
**Health Status**: HEALTHY ✅

🤖 Generated with [Claude Code](https://claude.ai/code)