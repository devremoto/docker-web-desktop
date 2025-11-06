# Docker Web Desktop - Docker Deployment

This document provides instructions for deploying the Docker Web Desktop application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose v2.0+ installed
- Git (to clone the repository)

## Project Structure

```
docker-web-desktop/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── .dockerignore
│   └── package.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── nginx.conf
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
└── DOCKER-DEPLOYMENT.md
```

## Quick Start

### Production Deployment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd docker-web-desktop
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development Deployment

For development with hot reloading:

1. **Run development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Docker Images

### Backend Image
- **Base Image:** `node:20-alpine`
- **Exposed Port:** 3000
- **Health Check:** `/api/health`
- **Features:**
  - Multi-stage build for optimization
  - Non-root user for security
  - Health checks for container monitoring

### Frontend Image
- **Base Image:** `node:20-alpine` (build stage) + `nginx:alpine` (runtime)
- **Exposed Port:** 80
- **Features:**
  - Multi-stage build for minimal size
  - Nginx for static file serving
  - Gzip compression enabled
  - API proxy configuration

## Environment Configuration

### Backend Environment Variables
- `NODE_ENV`: production/development
- `PORT`: Server port (default: 3000)

### Docker Socket Access
The backend container requires access to the Docker socket to manage Docker resources:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

## Health Checks

Both services include health checks:

- **Backend:** HTTP GET `/api/health`
- **Frontend:** HTTP GET to root `/`

Health checks ensure containers are ready before dependent services start.

## Networking

- **Network Name:** `docker-web-desktop-network`
- **Driver:** bridge
- **Inter-service Communication:** Services communicate using service names

## Commands Reference

### Build Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Run Services
```bash
# Run in background
docker-compose up -d

# Run with logs
docker-compose up

# Run specific service
docker-compose up backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Scale Services
```bash
# Scale backend service
docker-compose up -d --scale backend=3
```

### Stop and Clean
```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove with volumes
docker-compose down -v

# Remove with images
docker-compose down --rmi all
```

## Development Workflow

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Make changes to source code:**
   - Backend changes trigger nodemon restart
   - Frontend changes trigger Vite hot reload

3. **View real-time logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

## Production Deployment

### Using Docker Compose
```bash
# Pull latest images (if using registry)
docker-compose pull

# Deploy with restart policy
docker-compose up -d --force-recreate
```

### Manual Docker Commands
```bash
# Build backend image
docker build -t docker-web-desktop-backend ./backend

# Build frontend image
docker build -t docker-web-desktop-frontend ./frontend

# Create network
docker network create docker-web-desktop-network

# Run backend
docker run -d \
  --name docker-web-desktop-backend \
  --network docker-web-desktop-network \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  docker-web-desktop-backend

# Run frontend
docker run -d \
  --name docker-web-desktop-frontend \
  --network docker-web-desktop-network \
  -p 80:80 \
  docker-web-desktop-frontend
```

## Security Considerations

1. **Non-root User:** Backend runs as non-root user (nodejs:1001)
2. **Docker Socket:** Limited to read-only operations where possible
3. **Network Isolation:** Services run in isolated Docker network
4. **Security Headers:** Nginx includes security headers
5. **Minimal Images:** Alpine-based images for smaller attack surface

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check port usage
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3000
   ```

2. **Docker socket permissions:**
   ```bash
   # Add user to docker group (Linux)
   sudo usermod -aG docker $USER
   ```

3. **Container logs:**
   ```bash
   # Check container status
   docker-compose ps
   
   # View logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

4. **Health check failures:**
   ```bash
   # Check health status
   docker-compose ps
   
   # Test health endpoints manually
   curl http://localhost:3000/api/health
   curl http://localhost/
   ```

### Performance Optimization

1. **Use .dockerignore:** Exclude unnecessary files from build context
2. **Multi-stage builds:** Minimize final image size
3. **Layer caching:** Order Dockerfile commands for optimal caching
4. **Resource limits:** Set memory and CPU limits for containers

## Monitoring

### Container Stats
```bash
# Real-time stats
docker stats

# Compose stats
docker-compose top
```

### Logs
```bash
# Follow logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > application.log
```

## Backup and Recovery

### Data Volumes
```bash
# Backup volumes
docker run --rm -v docker-web-desktop_app-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v docker-web-desktop_app-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## Support

For issues or questions:
1. Check container logs: `docker-compose logs`
2. Verify health checks: `docker-compose ps`
3. Review this documentation
4. Check Docker and Docker Compose versions