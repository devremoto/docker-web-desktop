import { defineStore } from 'pinia'
import apiService from '../services/api'

interface Container {
    Id: string
    Names: string[]
    Image: string
    ImageID?: string  // Made optional since it might not always be present
    State: string
    Status: string
    Ports: any[]
    Created: number
    Mounts?: Array<{
        Type: string
        Name?: string
        Source?: string
        Destination?: string
    }>
    NetworkSettings?: {
        Networks: Record<string, any>
    }
    HostConfig?: {
        NetworkMode?: string
    }
    [key: string]: any
}

interface DockerImage {
    Id: string
    RepoTags: string[]
    Created: number
    Size: number
    [key: string]: any
}

interface Volume {
    Name: string
    Driver: string
    Mountpoint: string
    [key: string]: any
}

interface Network {
    Id: string
    Name: string
    Driver: string
    [key: string]: any
}

interface DockerState {
    containers: Container[]
    images: DockerImage[]
    volumes: Volume[]
    networks: Network[]
    loading: boolean
    error: string | null
    containerSource: string
}

interface GroupedNetwork extends Network {
    containers: Container[]
    isSystem: boolean
}

export const useDockerStore = defineStore('docker', {
    state: (): DockerState => ({
        containers: [],
        images: [],
        volumes: [],
        networks: [],
        loading: false,
        error: null,
        containerSource: typeof localStorage !== 'undefined' ? localStorage.getItem('dockerSource') || 'local' : 'local'
    }),

    getters: {
        runningContainers: (state): Container[] => state.containers.filter(c => c.State === 'running'),
        stoppedContainers: (state): Container[] => state.containers.filter(c => c.State === 'exited'),
        totalContainers: (state): number => state.containers.length,
        totalImages: (state): number => state.images.length,
        totalVolumes: (state): number => {
            return state.volumes.length
        },
        totalNetworks: (state): number => state.networks.length,

        // Group images by container usage
        groupedImages: (state): { used: (DockerImage & { containers: Container[] })[], orphaned: (DockerImage & { containers: Container[] })[] } => {
            const groups: { used: (DockerImage & { containers: Container[] })[], orphaned: (DockerImage & { containers: Container[] })[] } = { used: [], orphaned: [] }

            // Group images based on the containers array from backend
            state.images.forEach(image => {
                // If image has containers array from backend, use that
                if (image.containers !== undefined) {
                    if (image.containers.length > 0) {
                        groups.used.push(image as DockerImage & { containers: Container[] })
                    } else {
                        groups.orphaned.push(image as DockerImage & { containers: Container[] })
                    }
                } else {
                    // Fallback to old logic if containers array not provided
                    const imageContainers = state.containers.filter(container =>
                        container.ImageID === image.Id ||
                        (container.Image && image.RepoTags && image.RepoTags.some(tag => tag === container.Image))
                    )

                    const imageData = {
                        ...image,
                        containers: imageContainers
                    }

                    if (imageContainers.length > 0) {
                        groups.used.push(imageData)
                    } else {
                        groups.orphaned.push(imageData)
                    }
                }
            })

            return groups
        },

        // Group volumes by container usage
        groupedVolumes: (state): { used: (Volume & { containers: Container[] })[], orphaned: (Volume & { containers: Container[] })[] } => {
            const groups: { used: (Volume & { containers: Container[] })[], orphaned: (Volume & { containers: Container[] })[] } = { used: [], orphaned: [] }
            const usedVolumeNames = new Set<string>()

            // Collect all volume names used by containers
            state.containers.forEach(container => {
                if (container.Mounts) {
                    container.Mounts.forEach(mount => {
                        if (mount.Type === 'volume' && mount.Name) {
                            usedVolumeNames.add(mount.Name)
                        }
                    })
                }
            })

            // Group volumes
            state.volumes.forEach(volume => {
                const volumeData = {
                    ...volume,
                    containers: state.containers.filter(container =>
                        container.Mounts && container.Mounts.some(mount =>
                            mount.Type === 'volume' && mount.Name === volume.Name
                        )
                    )
                }

                if (usedVolumeNames.has(volume.Name)) {
                    groups.used.push(volumeData)
                } else {
                    groups.orphaned.push(volumeData)
                }
            })

            return groups
        },

        // Group networks by container usage
        groupedNetworks: (state): { used: GroupedNetwork[], orphaned: GroupedNetwork[] } => {
            const groups: { used: GroupedNetwork[], orphaned: GroupedNetwork[] } = { used: [], orphaned: [] }
            const usedNetworkIds = new Set<string>()
            const systemNetworks = ['bridge', 'host', 'none']

            // Collect all network IDs used by containers
            state.containers.forEach(container => {
                if (container.NetworkSettings && container.NetworkSettings.Networks) {
                    Object.keys(container.NetworkSettings.Networks).forEach(networkName => {
                        const network = state.networks.find(n => n.Name === networkName)
                        if (network) {
                            usedNetworkIds.add(network.Id)
                        }
                    })
                }
                // Also check HostConfig.NetworkMode
                if (container.HostConfig?.NetworkMode) {
                    const network = state.networks.find(n => n.Name === container.HostConfig!.NetworkMode)
                    if (network) {
                        usedNetworkIds.add(network.Id)
                    }
                }
            })

            // Group networks
            state.networks.forEach(network => {
                const networkData: GroupedNetwork = {
                    ...network,
                    containers: state.containers.filter(container => {
                        if (container.NetworkSettings && container.NetworkSettings.Networks) {
                            return Object.keys(container.NetworkSettings.Networks).includes(network.Name)
                        }
                        if (container.HostConfig && container.HostConfig.NetworkMode === network.Name) {
                            return true
                        }
                        return false
                    }),
                    isSystem: systemNetworks.includes(network.Name)
                }

                if (usedNetworkIds.has(network.Id) || networkData.isSystem) {
                    groups.used.push(networkData)
                } else {
                    groups.orphaned.push(networkData)
                }
            })

            return groups
        }
    },

    actions: {
        setLoading(loading: boolean): void {
            this.loading = loading
        },

        setError(error: string | null): void {
            this.error = error
        },

        setContainerSource(source: string): void {
            this.containerSource = source
        },

        // Container actions
        async fetchContainers(source?: string): Promise<void> {
            try {
                this.setLoading(true)
                const sourceToUse = source || this.containerSource
                this.containers = await apiService.getContainers(true, sourceToUse) as Container[]
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async startContainer(id: string): Promise<void> {
            try {
                await apiService.startContainer(id, this.containerSource)
                await this.fetchContainers(this.containerSource)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        async stopContainer(id: string): Promise<void> {
            try {
                await apiService.stopContainer(id, this.containerSource)
                await this.fetchContainers(this.containerSource)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        async removeContainer(id: string, force: boolean = false): Promise<void> {
            try {
                await apiService.removeContainer(id, force, this.containerSource)
                await this.fetchContainers(this.containerSource)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Image actions
        async fetchImages(source?: string): Promise<void> {
            try {
                this.setLoading(true)
                const sourceToUse = source || this.containerSource
                this.images = await apiService.getImages(sourceToUse) as DockerImage[]
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async removeImage(id: string, force: boolean = false): Promise<void> {
            try {
                await apiService.removeImage(id, force, this.containerSource)
                await this.fetchImages(this.containerSource)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Volume actions
        async fetchVolumes(source?: string): Promise<void> {
            try {
                this.setLoading(true)
                const sourceToUse = source || this.containerSource
                const volumesResponse: any = await apiService.getVolumes(sourceToUse)

                this.volumes = volumesResponse

                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async removeVolume(name: string, force: boolean = false): Promise<void> {
            try {
                await apiService.removeVolume(name, force, this.containerSource)
                await this.fetchVolumes(this.containerSource)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Network actions
        async fetchNetworks(source?: string): Promise<void> {
            try {
                this.setLoading(true)
                const sourceToUse = source || this.containerSource
                this.networks = await apiService.getNetworks(sourceToUse) as Network[]
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async removeNetwork(id: string, force: boolean = false): Promise<void> {
            try {
                await apiService.removeNetwork(id, force, this.containerSource)
                await this.fetchNetworks(this.containerSource)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Fetch all data
        async fetchAll(): Promise<void> {
            await Promise.all([
                this.fetchContainers(),
                this.fetchImages(),
                this.fetchVolumes(),
                this.fetchNetworks()
            ])
        }
    }
})