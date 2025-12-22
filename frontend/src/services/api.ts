import Environment from '@/utils/environment'
import axios, { type AxiosInstance } from 'axios'
import { io, type Socket } from 'socket.io-client'

let BASE_URL = Environment.config.apiBaseUrl

interface ProcessedCommand {
    command: string
    [key: string]: any
}

interface ContainerInfo {
    Id: string
    Names: string[]
    Image: string
    State: string
    Status: string
    Ports: any[]
    Created: number
    [key: string]: any
}

interface ImageInfo {
    Id: string
    RepoTags: string[]
    Created: number
    Size: number
    [key: string]: any
}

interface VolumeInfo {
    Name: string
    Driver: string
    Mountpoint: string
    [key: string]: any
}

interface NetworkInfo {
    Id: string
    Name: string
    Driver: string
    [key: string]: any
}

class ApiService {
    private api: AxiosInstance
    private socket: Socket

    constructor() {
        this.api = axios.create({
            baseURL: `${BASE_URL}/api`,
            timeout: 10000
        })

        this.socket = io(BASE_URL)

    }

    async executeCommand(processedCommand: ProcessedCommand, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const response = await this.api.post('/commands/execute', {
            command: processedCommand.command || processedCommand,
            source: source,
            wslDistro
        })
        return response.data
    }

    async openCommand(processedCommand: ProcessedCommand, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const response = await this.api.post('/commands/openconsole', {
            command: processedCommand.command || processedCommand,
            source: source,
            wslDistro
        })
        return response.data
    }

    // Container methods
    async getContainers(all: boolean = true, source: string = 'local'): Promise<ContainerInfo[]> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers?all=${all}&source=${source}${distroParam}`)
        return response.data
    }

    async getContainer(id: string, source: string = 'local'): Promise<ContainerInfo> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers/${id}?source=${source}${distroParam}`)
        return response.data
    }

    async startContainer(id: string, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const response = await this.api.post(`/containers/${id}/start?source=${source}`, { wslDistro })
        return response.data
    }

    async stopContainer(id: string, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const response = await this.api.post(`/containers/${id}/stop?source=${source}`, { wslDistro })
        return response.data
    }

    async removeContainer(id: string, force: boolean = false, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.delete(`/containers/${id}?force=${force}&source=${source}${distroParam}`)
        return response.data
    }

    async getContainerLogs(id: string, tail: number = 100, source: string = 'local'): Promise<string> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers/${id}/logs?tail=${tail}&source=${source}${distroParam}`)
        return response.data
    }

    async inspectContainer(id: string, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers/${id}/inspect?source=${source}${distroParam}`)
        return response.data
    }

    async getContainerStats(id: string, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers/${id}/stats?source=${source}${distroParam}`)
        return response.data
    }

    async getContainerFiles(id: string, path: string = '/', source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers/${id}/files?source=${source}${distroParam}`, {
            params: { path }
        })
        return response.data
    }

    async downloadContainerFile(id: string, filePath: string, source: string = 'local'): Promise<Blob> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/containers/${id}/files/download?source=${source}${distroParam}`, {
            params: { path: filePath },
            responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filePath.split('/').pop() || 'download')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return response.data
    }

    async execContainer(id: string, command: string, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const response = await this.api.post(`/containers/${id}/exec?source=${source}`, {
            command,
            wslDistro
        })
        return response.data
    }

    async restartContainer(id: string, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const response = await this.api.post(`/containers/${id}/restart?source=${source}`, { wslDistro })
        return response.data
    }

    // Image methods
    async getImages(source: string = 'local'): Promise<ImageInfo[]> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/images?source=${source}${distroParam}`)
        return response.data
    }

    async removeImage(id: string, force: boolean = false, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.delete(`/images/${id}?force=${force}&source=${source}${distroParam}`)
        return response.data
    }

    // Volume methods
    async getVolumes(source: string = 'local'): Promise<{ Volumes: VolumeInfo[] }> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/volumes?source=${source}${distroParam}`)
        return response.data
    }

    async removeVolume(name: string, force: boolean = false, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.delete(`/volumes/${name}?force=${force}&source=${source}${distroParam}`)
        return response.data
    }

    // Network methods
    async getNetworks(source: string = 'local'): Promise<NetworkInfo[]> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.get(`/networks?source=${source}${distroParam}`)
        return response.data
    }

    async removeNetwork(id: string, force: boolean = false, source: string = 'local'): Promise<any> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        const distroParam = source === 'wsl2' && wslDistro ? `&wslDistro=${encodeURIComponent(wslDistro)}` : ''
        const response = await this.api.delete(`/networks/${id}?force=${force}&source=${source}${distroParam}`)
        return response.data
    }

    // Health check
    async healthCheck(): Promise<any> {
        const response = await this.api.get('/health')
        return response.data
    }

    // Socket methods
    onContainerStateChanged(callback: () => void): void {
        this.socket.on('containerStateChanged', callback)
    }

    onContainerRemoved(callback: () => void): void {
        this.socket.on('containerRemoved', callback)
    }

    onImageRemoved(callback: () => void): void {
        this.socket.on('imageRemoved', callback)
    }

    onVolumeRemoved(callback: () => void): void {
        this.socket.on('volumeRemoved', callback)
    }

    onNetworkRemoved(callback: () => void): void {
        this.socket.on('networkRemoved', callback)
    }

    disconnect(): void {
        this.socket.disconnect()
    }

    getComposeFile(projectName: string, workingDir: string, configFiles: string, source: string = 'local'): Promise<{ fileName: string; content: string }> {
        const wslDistro = localStorage.getItem('wslDistro') || undefined
        return this.api.post('/compose/file', {
            projectName,
            workingDir,
            configFiles,
            source,
            wslDistro
        }).then(response => response.data)
    }

    async searchDockerHubImages(query: string, officialOnly: boolean = false): Promise<any> {
        if (query.length < 2) {
            return { results: [] }
        }
        try {
            const response = await this.api.post('/commands/search-image', { q: query })

            // Filter for official images if requested
            let results = response.data.results || []
            if (officialOnly) {
                results = results.filter((repo: any) => repo.is_official === true)
            }

            return {
                success: response.data.success,
                results: results,
                count: results.length
            }
        } catch (error) {
            console.error('Error searching Docker Hub:', error)
            return { results: [] }
        }
    }

    async searchDockerHubImageTags(imageName: string): Promise<any> {
        if (!imageName || imageName.length === 0) {
            return { results: [] }
        }
        try {
            const response = await this.api.get(`/commands/search-image-tags?image=${encodeURIComponent(imageName)}`)

            return {
                success: response.data.success,
                results: response.data.results || [],
                count: response.data.count || 0,
                image: imageName
            }
        } catch (error) {
            console.error('Error searching Docker Hub tags:', error)
            return { results: [] }
        }
    }
}
export default new ApiService()