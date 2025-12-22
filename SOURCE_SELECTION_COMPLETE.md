# Docker Source Selection - Complete Implementation

All Docker resources (containers, images, volumes, networks, and services) now support switching between Local and WSL2 Docker daemons.

## Backend Changes

### Updated Routes
All routes now accept a `source` query parameter (default: 'local'):

1. **images.js** - GET /api/images?source=local|wsl2
   - Uses `DockerService.forSource(source)` to get the appropriate Docker instance
   
2. **volumes.js** - GET /api/volumes?source=local|wsl2
   - Uses `DockerService.forSource(source)` to get the appropriate Docker instance
   
3. **networks.js** - GET /api/networks?source=local|wsl2
   - Uses `DockerService.forSource(source)` to get the appropriate Docker instance
   
4. **services.js** - GET /api/services?source=local|wsl2
   - Uses `DockerService.forSource(source)` to access Docker Swarm services
   - GET /api/services/:id?source=local|wsl2 for specific service details

5. **containers.js** (already updated) - GET /api/containers?source=local|wsl2
   
6. **commands.js** (already updated) - POST /api/commands/execute with source parameter
   - Wraps commands with `wsl.exe -d Ubuntu --` when source=wsl2

## Frontend Changes

### API Service (api.ts)
Updated all resource fetching methods to accept source parameter:
- `getImages(source: string = 'local')`
- `getVolumes(source: string = 'local')`
- `getNetworks(source: string = 'local')`
- `getContainers(all, source: string = 'local')` (already updated)
- `executeCommand(command, source: string = 'local')` (already updated)
- `openCommand(command, source: string = 'local')` (already updated)

### Store (docker.ts)
Updated all fetch actions to use the selected source:
- `fetchImages(source?: string)` - Uses `this.containerSource` by default
- `fetchVolumes(source?: string)` - Uses `this.containerSource` by default
- `fetchNetworks(source?: string)` - Uses `this.containerSource` by default
- `fetchContainers(source?: string)` (already updated)

The `containerSource` state is:
- Initialized from localStorage on app startup
- Updated when user changes the dropdown in Navbar
- Automatically saved to localStorage for persistence

### Navbar (Navbar.vue) (already updated)
- Dropdown selector for Local/WSL2
- Saves selection to localStorage
- Updates the store's `containerSource`
- Triggers refresh of all Docker resources

## How It Works

1. **User selects source** in Navbar dropdown (Local or WSL2)
2. **Selection is saved** to localStorage for persistence
3. **Store is updated** with new source via `setContainerSource()`
4. **All resources refresh** using the new source
5. **Backend routes** receive source parameter and use `DockerService.forSource(source)` to connect to the correct Docker daemon
6. **Commands execute** in the appropriate environment (Windows cmd for local, WSL2 bash for wsl2)

## Testing

To verify the implementation:

1. Switch between Local and WSL2 in the navbar dropdown
2. Navigate to different views (Containers, Images, Volumes, Networks)
3. Verify that resources from the selected source are displayed
4. Try executing commands - they should run in the correct environment
5. Refresh the page - selection should persist

## Architecture Notes

- **Backend**: `DockerService.forSource(source)` factory method creates appropriate Docker client
- **Frontend**: Single source of truth in store's `containerSource` state
- **Persistence**: localStorage ensures selection survives page refreshes
- **Commands**: WSL2 commands wrapped with `wsl.exe -d Ubuntu --` prefix
