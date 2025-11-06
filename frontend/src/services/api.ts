import Environment from '@/utils/environment'
import axios, { type AxiosInstance } from 'axios'
import { io, type Socket } from 'socket.io-client'

let BASE_URL = Environment.config.apiBaseUrl
console.log('META', import.meta.env)

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

    async executeCommand(processedCommand: ProcessedCommand): Promise<any> {
        const response = await this.api.post('/commands/execute', {
            command: processedCommand
        })
        return response.data
    }

    async openCommand(processedCommand: ProcessedCommand): Promise<any> {
        const response = await this.api.post('/commands/openconsole', {
            command: processedCommand
        })
        return response.data
    }

    // Container methods
    async getContainers(all: boolean = true): Promise<ContainerInfo[]> {
        const response = await this.api.get(`/containers?all=${all}`)
        return response.data
    }

    async getContainer(id: string): Promise<ContainerInfo> {
        const response = await this.api.get(`/containers/${id}`)
        return response.data
    }

    async startContainer(id: string): Promise<any> {
        const response = await this.api.post(`/containers/${id}/start`)
        return response.data
    }

    async stopContainer(id: string): Promise<any> {
        const response = await this.api.post(`/containers/${id}/stop`)
        return response.data
    }

    async removeContainer(id: string, force: boolean = false): Promise<any> {
        const response = await this.api.delete(`/containers/${id}?force=${force}`)
        return response.data
    }

    async getContainerLogs(id: string, tail: number = 100): Promise<string> {
        const response = await this.api.get(`/containers/${id}/logs?tail=${tail}`)
        return response.data
    }

    async inspectContainer(id: string): Promise<any> {
        const response = await this.api.get(`/containers/${id}/inspect`)
        return response.data
    }

    async getContainerStats(id: string): Promise<any> {
        const response = await this.api.get(`/containers/${id}/stats`)
        return response.data
    }

    async getContainerFiles(id: string, path: string = '/'): Promise<any> {
        const response = await this.api.get(`/containers/${id}/files`, {
            params: { path }
        })
        return response.data
    }

    async downloadContainerFile(id: string, filePath: string): Promise<Blob> {
        const response = await this.api.get(`/containers/${id}/files/download`, {
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

    async execContainer(id: string, command: string): Promise<any> {
        const response = await this.api.post(`/containers/${id}/exec`, {
            command
        })
        return response.data
    }

    async restartContainer(id: string): Promise<any> {
        const response = await this.api.post(`/containers/${id}/restart`)
        return response.data
    }

    // Image methods
    async getImages(): Promise<ImageInfo[]> {
        const response = await this.api.get('/images')
        return response.data
    }

    async removeImage(id: string, force: boolean = false): Promise<any> {
        const response = await this.api.delete(`/images/${id}?force=${force}`)
        return response.data
    }

    // Volume methods
    async getVolumes(): Promise<{ Volumes: VolumeInfo[] }> {
        const response = await this.api.get('/volumes')
        return response.data
    }

    async removeVolume(name: string): Promise<any> {
        const response = await this.api.delete(`/volumes/${name}`)
        return response.data
    }

    // Network methods
    async getNetworks(): Promise<NetworkInfo[]> {
        const response = await this.api.get('/networks')
        return response.data
    }

    async removeNetwork(id: string): Promise<any> {
        const response = await this.api.delete(`/networks/${id}`)
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

    getComposeFile(projectName: string, workingDir: string, configFiles: string): Promise<{ fileName: string; content: string }> {
        return this.api.post('/compose/file', {
            projectName,
            workingDir,
            configFiles
        }).then(response => response.data)
    }
}

export default new ApiService()