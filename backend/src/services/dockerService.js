const Docker = require('dockerode');

class DockerService {
    constructor() {
        // Initialize Docker connection
        // On Windows, Docker Desktop exposes the API through named pipe
        this.docker = new Docker({
            socketPath: process.platform === 'win32' ? '\\\\.\\pipe\\docker_engine' : '/var/run/docker.sock'
        });
    }

    async getContainers(all = true) {
        try {
            const containers = await this.docker.listContainers({ all });

            // Enhance containers with inspect data for better grouping
            const enhancedContainers = await Promise.all(
                containers.map(async (container) => {
                    try {
                        const containerObj = this.docker.getContainer(container.Id);
                        const inspectData = await containerObj.inspect();

                        return {
                            ...container,
                            Labels: inspectData.Config.Labels || {},
                            NetworkSettings: inspectData.NetworkSettings || {}
                        };
                    } catch (error) {
                        // If inspect fails, return original container data
                        console.warn(`Failed to inspect container ${container.Id}:`, error.message);
                        return container;
                    }
                })
            );

            return enhancedContainers;
        } catch (error) {
            throw new Error(`Failed to get containers: ${error.message}`);
        }
    }

    async getContainer(id) {
        try {
            const container = this.docker.getContainer(id);
            const info = await container.inspect();
            return info;
        } catch (error) {
            throw new Error(`Failed to get container ${id}: ${error.message}`);
        }
    }

    async startContainer(id) {
        try {
            const container = this.docker.getContainer(id);
            await container.start();
            return { success: true, message: `Container ${id} started` };
        } catch (error) {
            throw new Error(`Failed to start container ${id}: ${error.message}`);
        }
    }

    async stopContainer(id) {
        try {
            const container = this.docker.getContainer(id);
            await container.stop();
            return { success: true, message: `Container ${id} stopped` };
        } catch (error) {
            throw new Error(`Failed to stop container ${id}: ${error.message}`);
        }
    }

    async removeContainer(id, force = false) {
        try {
            const container = this.docker.getContainer(id);
            await container.remove({ force });
            return { success: true, message: `Container ${id} removed` };
        } catch (error) {
            throw new Error(`Failed to remove container ${id}: ${error.message}`);
        }
    }

    async getContainerLogs(id, tail = 100) {
        try {
            const container = this.docker.getContainer(id);
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                tail: tail,
                timestamps: true
            });

            // Convert buffer to string
            let logString = logs.toString('utf8');

            // Remove Docker multiplexed stream headers (8-byte headers)
            // Docker uses a multiplexed stream format with 8-byte headers
            // Header format: [STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4]
            logString = logString.replace(/[\u0001\u0002][\u0000]{3}[\u0000-\uFFFF]{4}/g, '');

            // Remove any remaining null bytes and control characters
            logString = logString.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

            return logString;
        } catch (error) {
            throw new Error(`Failed to get logs for container ${id}: ${error.message}`);
        }
    }

    async inspectContainer(id) {
        try {
            const container = this.docker.getContainer(id);
            const inspection = await container.inspect();
            return inspection;
        } catch (error) {
            throw new Error(`Failed to inspect container ${id}: ${error.message}`);
        }
    }

    async getContainerStats(id) {
        try {
            const container = this.docker.getContainer(id);
            const stats = await container.stats({ stream: false });

            // Calculate CPU percentage
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const numCpus = stats.cpu_stats.online_cpus || 1;
            const cpuPercentage = (cpuDelta / systemDelta) * numCpus * 100.0;

            // Calculate memory percentage
            const memoryUsage = stats.memory_stats.usage || 0;
            const memoryLimit = stats.memory_stats.limit || 0;
            const memoryPercentage = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100.0 : 0;

            // Network I/O
            let networkRx = 0;
            let networkTx = 0;
            if (stats.networks) {
                Object.values(stats.networks).forEach(network => {
                    networkRx += network.rx_bytes || 0;
                    networkTx += network.tx_bytes || 0;
                });
            }

            // Block I/O
            let blockRead = 0;
            let blockWrite = 0;
            if (stats.blkio_stats && stats.blkio_stats.io_service_bytes_recursive) {
                stats.blkio_stats.io_service_bytes_recursive.forEach(item => {
                    if (item.op === 'Read') blockRead += item.value;
                    if (item.op === 'Write') blockWrite += item.value;
                });
            }

            return {
                cpuPercentage: cpuPercentage.toFixed(2),
                memoryPercentage: memoryPercentage.toFixed(2),
                memoryUsage: memoryUsage,
                memoryLimit: memoryLimit,
                networkRx: networkRx,
                networkTx: networkTx,
                blockRead: blockRead,
                blockWrite: blockWrite
            };
        } catch (error) {
            throw new Error(`Failed to get stats for container ${id}: ${error.message}`);
        }
    }

    async getContainerFiles(id, path = '/') {
        try {
            const container = this.docker.getContainer(id);

            // Use exec to list files in the container
            const exec = await container.exec({
                Cmd: ['ls', '-la', '--time-style=iso', path],
                AttachStdout: true,
                AttachStderr: true
            });

            const stream = await exec.start({ hijack: true, stdin: false });

            return new Promise((resolve, reject) => {
                let output = '';

                stream.on('data', (chunk) => {
                    output += chunk.toString();
                });

                stream.on('end', () => {
                    try {
                        const files = this.parseFileList(output);
                        resolve(files);
                    } catch (error) {
                        reject(error);
                    }
                });

                stream.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Failed to get files for container ${id}: ${error.message}`);
        }
    }

    parseFileList(output) {
        const lines = output.split('\n').filter(line => line.trim());
        const files = [];

        lines.forEach(line => {
            // Skip total line and empty lines
            if (line.startsWith('total') || !line.trim()) return;

            // Parse ls -la output
            const parts = line.split(/\s+/);
            if (parts.length < 9) return;

            const permissions = parts[0];
            const size = parseInt(parts[4]) || 0;
            const date = parts[5] + ' ' + parts[6];
            const name = parts.slice(8).join(' ');

            // Skip . and .. entries
            if (name === '.' || name === '..') return;

            const isDirectory = permissions.startsWith('d');

            files.push({
                name: name,
                type: isDirectory ? 'directory' : 'file',
                size: isDirectory ? 0 : size,
                modified: date,
                permissions: permissions
            });
        });

        return files;
    }

    async downloadContainerFile(id, filePath) {
        try {
            const container = this.docker.getContainer(id);
            const stream = await container.getArchive({ path: filePath });
            return stream;
        } catch (error) {
            throw new Error(`Failed to download file ${filePath} from container ${id}: ${error.message}`);
        }
    }

    async execContainer(id, command) {
        try {
            const container = this.docker.getContainer(id);

            // Create exec instance
            const exec = await container.exec({
                Cmd: command.split(' '),
                AttachStdout: true,
                AttachStderr: true
            });

            // Start exec and get output
            const stream = await exec.start({ hijack: true, stdin: false });

            return new Promise((resolve, reject) => {
                let output = '';

                stream.on('data', (chunk) => {
                    output += chunk.toString();
                });

                stream.on('end', () => {
                    // Clean up the output similar to logs
                    output = output.replace(/[\u0001\u0002][\u0000]{3}[\u0000-\uFFFF]{4}/g, '');
                    output = output.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
                    resolve(output);
                });

                stream.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Failed to execute command in container ${id}: ${error.message}`);
        }
    }

    async restartContainer(id) {
        try {
            const container = this.docker.getContainer(id);
            await container.restart();
            return { success: true, message: `Container ${id} restarted` };
        } catch (error) {
            throw new Error(`Failed to restart container ${id}: ${error.message}`);
        }
    }

    async getImages() {
        try {
            const images = await this.docker.listImages();
            return images;
        } catch (error) {
            throw new Error(`Failed to get images: ${error.message}`);
        }
    }

    async removeImage(id, force = false) {
        try {
            const image = this.docker.getImage(id);
            await image.remove({ force });
            return { success: true, message: `Image ${id} removed` };
        } catch (error) {
            throw new Error(`Failed to remove image ${id}: ${error.message}`);
        }
    }

    async getVolumes() {
        try {
            const volumes = await this.docker.listVolumes();
            return volumes.Volumes || [];
        } catch (error) {
            throw new Error(`Failed to get volumes: ${error.message}`);
        }
    }

    async removeVolume(name) {
        try {
            const volume = this.docker.getVolume(name);
            await volume.remove();
            return { success: true, message: `Volume ${name} removed` };
        } catch (error) {
            throw new Error(`Failed to remove volume ${name}: ${error.message}`);
        }
    }

    async getNetworks() {
        try {
            const networks = await this.docker.listNetworks();
            return networks;
        } catch (error) {
            throw new Error(`Failed to get networks: ${error.message}`);
        }
    }

    async removeNetwork(id) {
        try {
            const network = this.docker.getNetwork(id);
            await network.remove();
            return { success: true, message: `Network ${id} removed` };
        } catch (error) {
            throw new Error(`Failed to remove network ${id}: ${error.message}`);
        }
    }

    async getSystemInfo() {
        try {
            const info = await this.docker.info();
            return info;
        } catch (error) {
            throw new Error(`Failed to get system info: ${error.message}`);
        }
    }
}

module.exports = new DockerService();