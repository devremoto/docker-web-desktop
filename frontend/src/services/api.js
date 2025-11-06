import axios from 'axios'
import { io } from 'socket.io-client'

const API_BASE_URL = 'http://localhost:3000/api'

class ApiService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000
        })

        this.socket = io('http://localhost:3000')
    }

    // Container methods
    async getContainers(all = true) {
        const response = await this.api.get(`/containers?all=${all}`)
        return response.data
    }

    async getContainer(id) {
        const response = await this.api.get(`/containers/${id}`)
        return response.data
    }

    async startContainer(id) {
        const response = await this.api.post(`/containers/${id}/start`)
        return response.data
    }

    async stopContainer(id) {
        const response = await this.api.post(`/containers/${id}/stop`)
        return response.data
    }

    async removeContainer(id, force = false) {
        const response = await this.api.delete(`/containers/${id}?force=${force}`)
        return response.data
    }

    async getContainerLogs(id, tail = 100) {
        const response = await this.api.get(`/containers/${id}/logs?tail=${tail}`)
        return response.data
    }

    async inspectContainer(id) {
        const response = await this.api.get(`/containers/${id}/inspect`)
        return response.data
    }

    async getContainerStats(id) {
        const response = await this.api.get(`/containers/${id}/stats`)
        return response.data
    }

    async getContainerFiles(id, path = '/') {
        const response = await this.api.get(`/containers/${id}/files`, {
            params: { path }
        })
        return response.data
    }

    async downloadContainerFile(id, filePath) {
        const response = await this.api.get(`/containers/${id}/files/download`, {
            params: { path: filePath },
            responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filePath.split('/').pop())
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return response.data
    }

    async execContainer(id, command) {
        const response = await this.api.post(`/containers/${id}/exec`, {
            command
        })
        return response.data
    }

    async restartContainer(id) {
        const response = await this.api.post(`/containers/${id}/restart`)
        return response.data
    }

    // Image methods
    async getImages() {
        const response = await this.api.get('/images')
        return response.data
    }

    async removeImage(id, force = false) {
        const response = await this.api.delete(`/images/${id}?force=${force}`)
        return response.data
    }

    // Volume methods
    async getVolumes() {
        const response = await this.api.get('/volumes')
        return response.data
    }

    async removeVolume(name) {
        const response = await this.api.delete(`/volumes/${name}`)
        return response.data
    }

    // Network methods
    async getNetworks() {
        const response = await this.api.get('/networks')
        return response.data
    }

    async removeNetwork(id) {
        const response = await this.api.delete(`/networks/${id}`)
        return response.data
    }

    // Health check
    async healthCheck() {
        const response = await this.api.get('/health')
        return response.data
    }

    // Socket methods
    onContainerStateChanged(callback) {
        this.socket.on('containerStateChanged', callback)
    }

    onContainerRemoved(callback) {
        this.socket.on('containerRemoved', callback)
    }

    onImageRemoved(callback) {
        this.socket.on('imageRemoved', callback)
    }

    onVolumeRemoved(callback) {
        this.socket.on('volumeRemoved', callback)
    }

    onNetworkRemoved(callback) {
        this.socket.on('networkRemoved', callback)
    }

    disconnect() {
        this.socket.disconnect()
    }
}

export default new ApiService()