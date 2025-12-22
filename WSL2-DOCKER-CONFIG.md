# WSL2 Docker Configuration Guide

This guide explains how to configure the Docker Web Desktop to access containers from both Windows Docker Desktop and WSL2 Docker daemon.

## Prerequisites

- Windows with WSL2 installed
- Docker Desktop for Windows OR Docker installed in WSL2
- Docker Web Desktop application

## Configuration Methods

### Method 1: TCP Connection (Recommended for separate WSL2 Docker)

If you have Docker running inside WSL2 (not Docker Desktop), you need to expose the Docker daemon on TCP:

1. **In your WSL2 terminal**, edit the Docker daemon configuration:
   ```bash
   sudo nano /etc/docker/daemon.json
   ```

2. Add TCP socket configuration:
   ```json
   {
     "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
   }
   ```

3. Restart Docker:
   ```bash
   sudo systemctl restart docker
   ```

4. **In Windows**, create/edit `.env` file in the backend directory:
   ```env
   WSL2_DOCKER_HOST=localhost
   WSL2_DOCKER_PORT=2375
   ```

5. Restart the backend server

### Method 2: Socket Path (For Docker Desktop with WSL2 integration)

If using Docker Desktop with WSL2 backend, both "Local" and "WSL2" typically point to the same daemon. Docker Desktop automatically handles this integration.

No additional configuration needed - just select "Local" in the dashboard dropdown.

### Method 3: Custom Socket Path

If you want to access WSL2 Docker via socket path:

1. Enable WSL2 network sharing
2. In `.env` file:
   ```env
   WSL2_DOCKER_SOCKET=\\wsl$\Ubuntu\var\run\docker.sock
   ```
   (Replace `Ubuntu` with your WSL2 distribution name)

## Usage

1. Start the backend server
2. Open the dashboard
3. Use the dropdown at the top to switch between "Local" and "WSL2"
4. The dashboard will show containers from the selected source

## Troubleshooting

### "Failed to get containers" error

- Check if Docker daemon is running in the selected source
- For WSL2 TCP: Ensure port 2375 is accessible: `curl http://localhost:2375/version`
- Check Windows Firewall settings

### Same containers showing for both Local and WSL2

- This is normal if you're using Docker Desktop with WSL2 backend
- Both point to the same Docker daemon managed by Docker Desktop
- To use separate Docker instances, install Docker directly in WSL2 (not Docker Desktop)

### Connection timeout

- Verify the WSL2_DOCKER_PORT and WSL2_DOCKER_HOST values in .env
- Check if Docker is listening on the configured port: 
  ```bash
  # In WSL2
  sudo netstat -tlnp | grep 2375
  ```

## Security Note

⚠️ **Warning**: Exposing Docker daemon on TCP without TLS is insecure and should only be used in development environments. For production, always use TLS certificates and authentication.

See [Docker daemon socket security](https://docs.docker.com/engine/security/protect-access/) for more information.
