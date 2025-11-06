# Development Guide

## Quick Start

1. **Backend Only**:
   ```bash
   cd backend
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

2. **Frontend Only**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Both (Windows)**:
   ```cmd
   start.bat
   ```

4. **Both (Linux/Mac)**:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## Testing API Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Containers
```bash
# List all containers
curl http://localhost:3000/api/containers

# Get specific container
curl http://localhost:3000/api/containers/{container_id}

# Start container
curl -X POST http://localhost:3000/api/containers/{container_id}/start

# Stop container
curl -X POST http://localhost:3000/api/containers/{container_id}/stop

# Remove container
curl -X DELETE http://localhost:3000/api/containers/{container_id}

# Get container logs
curl http://localhost:3000/api/containers/{container_id}/logs?tail=50
```

### Images
```bash
# List all images
curl http://localhost:3000/api/images

# Remove image
curl -X DELETE http://localhost:3000/api/images/{image_id}
```

### Volumes
```bash
# List all volumes
curl http://localhost:3000/api/volumes

# Remove volume
curl -X DELETE http://localhost:3000/api/volumes/{volume_name}
```

### Networks
```bash
# List all networks
curl http://localhost:3000/api/networks

# Remove network
curl -X DELETE http://localhost:3000/api/networks/{network_id}
```

## Development Tips

### Backend Development
- Use `npm run dev` for auto-restart on file changes
- Check logs for Docker API connection issues
- Ensure Docker Desktop is running before starting the backend

### Frontend Development
- Hot reload is enabled by default with Vite
- Check browser console for any JavaScript errors
- API calls to backend should work on `http://localhost:3000`

### Real-time Features
- WebSocket connection is established automatically
- Real-time updates work for container state changes, removals, etc.
- Check browser Developer Tools → Network tab for WebSocket connection

## Common Issues

### Backend Won't Start
- **Port 3000 in use**: Kill process on port 3000 or change PORT in .env
- **Docker connection error**: Ensure Docker Desktop is running
- **Module not found**: Run `npm install` in backend directory

### Frontend Won't Start
- **Dependencies missing**: Run `npm install` in frontend directory
- **Port conflict**: Vite will automatically use next available port
- **API connection issues**: Ensure backend is running on port 3000

### CORS Errors
- Backend CORS is configured for `http://localhost:8080` and common Vite ports
- If using different port, update CORS configuration in `backend/src/server.js`

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
docker-desktop-clone/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── routes/         # API endpoint definitions
│   │   ├── services/       # Docker integration logic
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── .env               # Environment variables
├── frontend/               # Vue.js SPA
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia state management
│   │   ├── services/      # API communication
│   │   └── router/        # Vue Router setup
│   └── package.json
├── start.bat              # Windows start script
├── start.sh               # Linux/Mac start script
└── README.md              # Main documentation
```