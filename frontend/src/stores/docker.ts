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
        error: null
    }),

    getters: {
        runningContainers: (state): Container[] => state.containers.filter(c => c.State === 'running'),
        stoppedContainers: (state): Container[] => state.containers.filter(c => c.State === 'exited'),
        totalContainers: (state): number => state.containers.length,
        totalImages: (state): number => state.images.length,
        totalVolumes: (state): number => state.volumes.length,
        totalNetworks: (state): number => state.networks.length,

        // Group images by container usage
        groupedImages: (state): { used: (DockerImage & { containers: Container[] })[], orphaned: (DockerImage & { containers: Container[] })[] } => {
            const groups: { used: (DockerImage & { containers: Container[] })[], orphaned: (DockerImage & { containers: Container[] })[] } = { used: [], orphaned: [] }
            const usedImageIds = new Set<string>()

            // Collect all image IDs used by containers
            state.containers.forEach(container => {
                if (container.ImageID) {
                    usedImageIds.add(container.ImageID)
                }
                if (container.Image) {
                    // Also check by image name/tag
                    const matchingImages = state.images.filter(img =>
                        img.RepoTags && img.RepoTags.some(tag => tag === container.Image)
                    )
                    matchingImages.forEach(img => usedImageIds.add(img.Id))
                }
            })

            // Group images
            state.images.forEach(image => {
                const imageData = {
                    ...image,
                    containers: state.containers.filter(container =>
                        container.ImageID === image.Id ||
                        (container.Image && image.RepoTags && image.RepoTags.some(tag => tag === container.Image))
                    )
                }

                if (usedImageIds.has(image.Id)) {
                    groups.used.push(imageData)
                } else {
                    groups.orphaned.push(imageData)
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

        // Container actions
        async fetchContainers(): Promise<void> {
            try {
                this.setLoading(true)
                this.containers = await apiService.getContainers() as Container[]
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async startContainer(id: string): Promise<void> {
            try {
                await apiService.startContainer(id)
                await this.fetchContainers()
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        async stopContainer(id: string): Promise<void> {
            try {
                await apiService.stopContainer(id)
                await this.fetchContainers()
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        async removeContainer(id: string, force: boolean = false): Promise<void> {
            try {
                await apiService.removeContainer(id, force)
                await this.fetchContainers()
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Image actions
        async fetchImages(): Promise<void> {
            try {
                this.setLoading(true)
                this.images = await apiService.getImages() as DockerImage[]
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async removeImage(id: string, force: boolean = false): Promise<void> {
            try {
                await apiService.removeImage(id, force)
                await this.fetchImages()
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Volume actions
        async fetchVolumes(): Promise<void> {
            try {
                this.setLoading(true)
                const volumesResponse = await apiService.getVolumes()
                this.volumes = volumesResponse.Volumes || []
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async removeVolume(name: string): Promise<void> {
            try {
                await apiService.removeVolume(name)
                await this.fetchVolumes()
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            }
        },

        // Network actions
        async fetchNetworks(): Promise<void> {
            try {
                this.setLoading(true)
                this.networks = await apiService.getNetworks() as Network[]
                this.setError(null)
            } catch (error) {
                this.setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                this.setLoading(false)
            }
        },

        async removeNetwork(id: string): Promise<void> {
            try {
                await apiService.removeNetwork(id)
                await this.fetchNetworks()
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