# Docker Source Selection - Testing Guide

## What Changed

1. **Docker Source Selector** moved to the **top navbar** (no longer on dashboard)
2. The selector is now persistent across all pages
3. Changing the source will fetch containers from the selected daemon

## How to Test

### 1. Check if the selector is visible
- Look at the top navbar - you should see a dropdown with "Local" and "WSL2" options

### 2. Test Local Containers
- Make sure the dropdown shows "Local"
- Click "Refresh" on the dashboard
- You should see containers from your Docker Desktop

### 3. Test WSL2 Containers (if configured)
- First, ensure your WSL2 Docker daemon is properly configured
  - See `WSL2-DOCKER-CONFIG.md` for setup instructions
- Select "WSL2" from the navbar dropdown
- Click "Refresh" on the dashboard
- You should see containers from WSL2 (if different from local)

### 4. Test the debug endpoint
Open your browser and navigate to:
```
http://localhost:3334/api/containers/test/source?source=local
http://localhost:3334/api/containers/test/source?source=wsl2
```

You should see JSON responses showing:
- The source being tested
- Whether connection was successful
- Docker information (container count, server version)

Example response:
```json
{
  "source": "local",
  "connected": true,
  "dockerInfo": {
    "Containers": 5,
    "ContainersRunning": 2,
    "ServerVersion": "26.0.0"
  }
}
```

## Common Issues

### "Still seeing same containers for Local and WSL2"
This is **normal** if you're using Docker Desktop with WSL2 backend. Both point to the same daemon.
To see different containers, you need to:
1. Have Docker running separately in WSL2 (not Docker Desktop)
2. Configure it to expose the daemon on TCP port 2375 (see WSL2-DOCKER-CONFIG.md)

### "Source selector not appearing in navbar"
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for errors
- Verify the app properly reloaded

### "Changes to dropdown don't work"
- Check browser console for errors
- Verify the debug endpoints show different sources are being sent
- Make sure backend is running and not cached

## Debug Steps

1. **Check frontend/backend communication:**
   ```
   http://localhost:3334/api/containers/test/source?source=local
   http://localhost:3334/api/containers/test/source?source=wsl2
   ```

2. **Check if containers endpoint gets source parameter:**
   Open DevTools → Network tab → select "local" in dropdown → Refresh
   - Look for request to `/api/containers?all=true&source=local`

3. **Check backend logs:**
   - Look at backend server output for any errors when fetching containers

4. **Check if WSL2 is properly configured:**
   If WSL2 Docker daemon isn't accessible, you'll see connection errors in the debug endpoint
