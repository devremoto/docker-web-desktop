import { defineStore } from 'pinia'
import apiService from '../services/api'

export const useDockerStore = defineStore('docker', {
    state: () => ({
        containers: [],
        images: [],
        volumes: [],
        networks: [],
        loading: false,
        error: null
    }),

    getters: {
        runningContainers: (state) => state.containers.filter(c => c.State === 'running'),
        stoppedContainers: (state) => state.containers.filter(c => c.State === 'exited'),
        totalContainers: (state) => state.containers.length,
        totalImages: (state) => state.images.length,
        totalVolumes: (state) => state.volumes.length,
        totalNetworks: (state) => state.networks.length,

        // Group images by container usage
        groupedImages: (state) => {
            const groups = { used: [], orphaned: [] }
            const usedImageIds = new Set()

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
        groupedVolumes: (state) => {
            const groups = { used: [], orphaned: [] }
            const usedVolumeNames = new Set()

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
        groupedNetworks: (state) => {
            const groups = { used: [], orphaned: [] }
            const usedNetworkIds = new Set()
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
                if (container.HostConfig && container.HostConfig.NetworkMode) {
                    const network = state.networks.find(n => n.Name === container.HostConfig.NetworkMode)
                    if (network) {
                        usedNetworkIds.add(network.Id)
                    }
                }
            })

            // Group networks
            state.networks.forEach(network => {
                const networkData = {
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
        setLoading(loading) {
            this.loading = loading
        },

        setError(error) {
            this.error = error
        },

        // Container actions
        async fetchContainers() {
            try {
                this.setLoading(true)
                this.containers = await apiService.getContainers()
                this.setError(null)
            } catch (error) {
                this.setError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        async startContainer(id) {
            try {
                await apiService.startContainer(id)
                await this.fetchContainers()
            } catch (error) {
                this.setError(error.message)
            }
        },

        async stopContainer(id) {
            try {
                await apiService.stopContainer(id)
                await this.fetchContainers()
            } catch (error) {
                this.setError(error.message)
            }
        },

        async removeContainer(id, force = false) {
            try {
                await apiService.removeContainer(id, force)
                await this.fetchContainers()
            } catch (error) {
                this.setError(error.message)
            }
        },

        // Image actions
        async fetchImages() {
            try {
                this.setLoading(true)
                this.images = await apiService.getImages()
                this.setError(null)
            } catch (error) {
                this.setError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        async removeImage(id, force = false) {
            try {
                await apiService.removeImage(id, force)
                await this.fetchImages()
            } catch (error) {
                this.setError(error.message)
            }
        },

        // Volume actions
        async fetchVolumes() {
            try {
                this.setLoading(true)
                this.volumes = await apiService.getVolumes()
                this.setError(null)
            } catch (error) {
                this.setError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        async removeVolume(name) {
            try {
                await apiService.removeVolume(name)
                await this.fetchVolumes()
            } catch (error) {
                this.setError(error.message)
            }
        },

        // Network actions
        async fetchNetworks() {
            try {
                this.setLoading(true)
                this.networks = await apiService.getNetworks()
                this.setError(null)
            } catch (error) {
                this.setError(error.message)
            } finally {
                this.setLoading(false)
            }
        },

        async removeNetwork(id) {
            try {
                await apiService.removeNetwork(id)
                await this.fetchNetworks()
            } catch (error) {
                this.setError(error.message)
            }
        },

        // Fetch all data
        async fetchAll() {
            await Promise.all([
                this.fetchContainers(),
                this.fetchImages(),
                this.fetchVolumes(),
                this.fetchNetworks()
            ])
        }
    }
})