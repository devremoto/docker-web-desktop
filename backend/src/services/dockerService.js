const Docker = require('dockerode');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class DockerService {
    constructor(options = {}) {

        this.source = options.source || 'local';
        this.wslDistro = options.wslDistro || process.env.WSL_DISTRO || 'Ubuntu';


        // Allow custom Docker connection (for WSL2, etc)
        if (options.source === 'wsl2') {
            // For WSL2, we'll use Docker CLI via wsl.exe
            // But still create a docker instance for methods that need it
            this.docker = new Docker({
                socketPath: process.platform === 'win32' ? '\\\\.\\pipe\\docker_engine' : '/var/run/docker.sock'
            });
            this.useWSL = true;
        } else if (options.dockerOptions) {
            this.docker = new Docker(options.dockerOptions);
            this.useWSL = false;
        } else {
            // Default: local Docker Desktop
            this.docker = new Docker({
                socketPath: process.platform === 'win32' ? '\\\\.\\pipe\\docker_engine' : '/var/run/docker.sock'
            });
            this.useWSL = false;
        }
    }

    async executeWSLDockerCommand(command) {
        try {
            //check if wslDistro is docker-desktop or docker-desktop-data and call docker directly
            if (this.wslDistro === 'docker-desktop' || this.wslDistro === 'docker-desktop-data') {
                const { stdout, stderr } = await execAsync(`docker ${command}`);
                if (stderr && !stderr.includes('WARNING')) {
                    console.warn('WSL Docker command warning:', stderr);
                }
                return stdout;
            }
            const { stdout, stderr } = await execAsync(`wsl.exe -d ${this.wslDistro} -- docker ${command}`);
            if (stderr && !stderr.includes('WARNING')) {
                console.warn('WSL Docker command warning:', stderr);
            }
            return stdout;
        } catch (error) {
            // Check if Docker is not installed in WSL2
            if (error.message.includes('command not found') || error.message.includes('docker: not found')) {
                throw new Error('Docker is not installed in WSL2 Ubuntu. Please install Docker inside WSL2 or use Local Docker.');
            }
            throw new Error(`WSL Docker command failed: ${error.message}`);
        }
    }

    // Factory for source selection
    static forSource(source) {
        return new DockerService({ source });
    }

    async getContainers(all = true) {
        try {
            if (this.useWSL) {
                // Use WSL Docker CLI
                const allFlag = all ? '-a' : '';
                const output = await this.executeWSLDockerCommand(`ps ${allFlag} --format "{{json .}}"`);

                // Split by }{ pattern to handle concatenated JSON objects
                let jsonStrings = output.trim();
                if (jsonStrings.includes('}{')) {
                    jsonStrings = jsonStrings.replace(/\}\{/g, '}\n{');
                }

                const lines = jsonStrings.split('\n').filter(line => line.trim());
                const containers = lines.map(line => {
                    try {
                        const parsed = JSON.parse(line.trim());
                        // Convert CLI format to Docker API format
                        return {
                            Id: parsed.ID,
                            Names: [parsed.Names.startsWith('/') ? parsed.Names : '/' + parsed.Names],
                            Image: parsed.Image,
                            ImageID: parsed.Image,
                            Command: parsed.Command,
                            Created: parsed.CreatedAt,
                            State: parsed.State,
                            Status: parsed.Status,
                            Ports: this.parsePorts(parsed.Ports),
                            Labels: {},
                            NetworkSettings: {}
                        };
                    } catch (error) {
                        console.warn('Failed to parse container line:', line, error);
                        return null;
                    }
                }).filter(c => c !== null);

                // Enhance with inspect data for grouping (compose labels, networks, mounts)
                const enhanced = await Promise.all(
                    containers.map(async (container) => {
                        try {
                            const inspectOut = await this.executeWSLDockerCommand(`inspect ${container.Id} --format "{{json .}}"`);
                            // Handle potential concatenated output (rare for single inspect)
                            const trimmed = inspectOut.trim();
                            const inspectJson = JSON.parse(trimmed);

                            return {
                                ...container,
                                Labels: (inspectJson.Config && inspectJson.Config.Labels) || {},
                                NetworkSettings: inspectJson.NetworkSettings || {},
                                Mounts: inspectJson.Mounts || [],
                                HostConfig: inspectJson.HostConfig || {}
                            };
                        } catch (err) {
                            console.warn(`WSL inspect failed for ${container.Id}:`, err.message);
                            return container;
                        }
                    })
                );

                return enhanced;
            }

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

    parsePorts(portsStr) {
        // Parse Docker CLI ports format like "0.0.0.0:8080->80/tcp"
        if (!portsStr) return [];

        return portsStr.split(',').map(p => p.trim()).filter(p => p).map(portMapping => {
            const match = portMapping.match(/(?:([^:]+):)?(\d+)->(\d+)\/(\w+)/);
            if (match) {
                return {
                    IP: match[1] || '0.0.0.0',
                    PrivatePort: parseInt(match[3]),
                    PublicPort: parseInt(match[2]),
                    Type: match[4]
                };
            }
            return null;
        }).filter(p => p !== null);
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
            if (this.useWSL) {
                await this.executeWSLDockerCommand(`start ${id}`);
                return { success: true, message: `Container ${id} started (WSL2)` };
            }
            const container = this.docker.getContainer(id);
            await container.start();
            return { success: true, message: `Container ${id} started` };
        } catch (error) {
            throw new Error(`Failed to start container ${id}: ${error.message}`);
        }
    }

    async stopContainer(id) {
        try {
            if (this.useWSL) {
                await this.executeWSLDockerCommand(`stop ${id}`);
                return { success: true, message: `Container ${id} stopped (WSL2)` };
            }
            const container = this.docker.getContainer(id);
            await container.stop();
            return { success: true, message: `Container ${id} stopped` };
        } catch (error) {
            throw new Error(`Failed to stop container ${id}: ${error.message}`);
        }
    }

    async removeContainer(id, force = false) {
        try {
            if (this.useWSL) {
                const forceFlag = force ? '-f ' : '';
                await this.executeWSLDockerCommand(`rm ${forceFlag}${id}`);
                return { success: true, message: `Container ${id} removed (WSL2)` };
            }
            const container = this.docker.getContainer(id);
            await container.remove({ force });
            return { success: true, message: `Container ${id} removed` };
        } catch (error) {
            throw new Error(`Failed to remove container ${id}: ${error.message}`);
        }
    }

    async getContainerLogs(id, tail = 100) {
        try {
            if (this.useWSL) {
                const stdout = await this.executeWSLDockerCommand(`logs --tail ${tail} --timestamps ${id}`);
                // Clean control characters similar to local
                let logString = stdout.toString('utf8');
                logString = logString.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
                return logString;
            }
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
            logString = logString.replace(/[\u0001\u0002][\u0000]{3}[\u0000-\uFFFF]{4}/g, '');
            logString = logString.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
            return logString;
        } catch (error) {
            throw new Error(`Failed to get logs for container ${id}: ${error.message}`);
        }
    }

    async inspectContainer(id) {
        try {
            if (this.useWSL) {
                const out = await this.executeWSLDockerCommand(`inspect ${id} --format "{{json .}}"`);
                return JSON.parse(out.trim());
            }
            const container = this.docker.getContainer(id);
            const inspection = await container.inspect();
            return inspection;
        } catch (error) {
            throw new Error(`Failed to inspect container ${id}: ${error.message}`);
        }
    }

    async getContainerStats(id) {
        try {
            if (this.useWSL) {
                const out = await this.executeWSLDockerCommand(`stats ${id} --no-stream --format "{{json .}}"`);
                const data = JSON.parse(out.trim());
                const cpuPercentage = parseFloat((data.CPUPerc || '0').replace('%', '')) || 0;
                const memoryPercentage = parseFloat((data.MemPerc || '0').replace('%', '')) || 0;
                const [memUsedStr, memLimitStr] = (data.MemUsage || '0 / 0').split('/').map(s => s.trim());
                const networkParts = (data.NetIO || '0 / 0').split('/').map(s => s.trim());
                const blockParts = (data.BlockIO || '0 / 0').split('/').map(s => s.trim());

                const memoryUsage = this.parseHumanBytes(memUsedStr);
                const memoryLimit = this.parseHumanBytes(memLimitStr);
                const networkRx = this.parseHumanBytes(networkParts[0] || '0');
                const networkTx = this.parseHumanBytes(networkParts[1] || '0');
                const blockRead = this.parseHumanBytes(blockParts[0] || '0');
                const blockWrite = this.parseHumanBytes(blockParts[1] || '0');

                return {
                    cpuPercentage: cpuPercentage.toFixed(2),
                    memoryPercentage: memoryPercentage.toFixed(2),
                    memoryUsage,
                    memoryLimit,
                    networkRx,
                    networkTx,
                    blockRead,
                    blockWrite
                };
            }

            const container = this.docker.getContainer(id);
            const stats = await container.stats({ stream: false });
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const numCpus = stats.cpu_stats.online_cpus || 1;
            const cpuPercentage = (cpuDelta / systemDelta) * numCpus * 100.0;
            const memoryUsage = stats.memory_stats.usage || 0;
            const memoryLimit = stats.memory_stats.limit || 0;
            const memoryPercentage = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100.0 : 0;
            let networkRx = 0;
            let networkTx = 0;
            if (stats.networks) {
                Object.values(stats.networks).forEach(network => {
                    networkRx += network.rx_bytes || 0;
                    networkTx += network.tx_bytes || 0;
                });
            }
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
            if (this.useWSL) {
                const stdout = await this.executeWSLDockerCommand(`exec ${id} ls -la --time-style=iso ${path}`);
                const files = this.parseFileList(stdout);
                return files;
            }
            const container = this.docker.getContainer(id);
            const exec = await container.exec({
                Cmd: ['ls', '-la', '--time-style=iso', path],
                AttachStdout: true,
                AttachStderr: true
            });
            const stream = await exec.start({ hijack: true, stdin: false });
            return new Promise((resolve, reject) => {
                let output = '';
                stream.on('data', (chunk) => { output += chunk.toString(); });
                stream.on('end', () => {
                    try { resolve(this.parseFileList(output)); } catch (error) { reject(error); }
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
            if (this.useWSL) {
                const stdout = await this.executeWSLDockerCommand(`exec ${id} ${command}`);
                let output = stdout.toString('utf8');
                output = output.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
                return output;
            }
            const container = this.docker.getContainer(id);
            const exec = await container.exec({
                Cmd: command.split(' '),
                AttachStdout: true,
                AttachStderr: true
            });
            const stream = await exec.start({ hijack: true, stdin: false });
            return new Promise((resolve, reject) => {
                let output = '';
                stream.on('data', (chunk) => { output += chunk.toString(); });
                stream.on('end', () => {
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
            if (this.useWSL) {
                await this.executeWSLDockerCommand(`restart ${id}`);
                return { success: true, message: `Container ${id} restarted (WSL2)` };
            }
            const container = this.docker.getContainer(id);
            await container.restart();
            return { success: true, message: `Container ${id} restarted` };
        } catch (error) {
            throw new Error(`Failed to restart container ${id}: ${error.message}`);
        }
    }

    async getImages() {
        try {
            let images;

            if (this.useWSL) {
                const output = await this.executeWSLDockerCommand('images --format "{{json .}}"');

                // Split by }{ pattern to handle concatenated JSON objects
                let jsonStrings = output.trim();
                if (jsonStrings.includes('}{')) {
                    jsonStrings = jsonStrings.replace(/\}\{/g, '}\n{');
                }

                const lines = jsonStrings.split('\n').filter(line => line.trim());
                images = lines.map(line => {
                    try {
                        const parsed = JSON.parse(line.trim());
                        return {
                            Id: parsed.ID,
                            RepoTags: [parsed.Repository + ':' + parsed.Tag].filter(t => t !== '<none>:<none>'),
                            Created: parsed.CreatedAt,
                            Size: this.parseSizeToBytes(parsed.Size),
                            VirtualSize: this.parseSizeToBytes(parsed.VirtualSize || parsed.Size)
                        };
                    } catch (error) {
                        console.warn('Failed to parse image line:', line, error);
                        return null;
                    }
                }).filter(i => i !== null);
            } else {
                images = await this.docker.listImages();
            }

            // Get containers to check which images are in use
            const containers = await this.getContainers();

            // Add containers array to each image
            images = images.map(image => {
                const imageContainers = containers.filter(container => {
                    // Get clean image ID without sha256: prefix
                    const cleanImageId = image.Id.replace('sha256:', '');
                    const cleanContainerImageId = (container.ImageID || '').replace('sha256:', '');

                    // Check if container's image matches this image by ID or tag
                    return cleanImageId === cleanContainerImageId ||
                        cleanImageId.startsWith(cleanContainerImageId) ||
                        cleanContainerImageId.startsWith(cleanImageId) ||
                        (image.RepoTags && image.RepoTags.some(tag =>
                            container.Image === tag ||
                            container.Image.includes(tag) ||
                            tag.includes(container.Image)
                        ));
                });

                return {
                    ...image,
                    containers: imageContainers.map(c => ({
                        Id: c.Id,
                        Names: c.Names || [c.Name || 'unknown'],
                        State: c.State
                    }))
                };
            });

            return images;
        } catch (error) {
            throw new Error(`Failed to get images: ${error.message}`);
        }
    }

    parseSizeToBytes(sizeStr) {
        if (!sizeStr) return 0;
        const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 };
        const match = sizeStr.match(/([\d.]+)\s*(\w+)/);
        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            return Math.floor(value * (units[unit] || 1));
        }
        return 0;
    }

    async removeImage(id, force = false) {
        try {
            if (this.useWSL) {
                const forceFlag = force ? '-f' : '';
                // Escape the command properly for WSL
                const command = `rmi ${forceFlag} "${id}"`.trim();
                console.log('WSL2 remove image command:', command);
                await this.executeWSLDockerCommand(command);
                return { success: true, message: `Image ${id} removed` };
            }

            const image = this.docker.getImage(id);
            await image.remove({ force });
            return { success: true, message: `Image ${id} removed` };
        } catch (error) {
            throw new Error(`Failed to remove image ${id}: ${error.message}`);
        }
    }

    async getVolumes() {
        try {
            if (this.useWSL) {
                const output = await this.executeWSLDockerCommand('volume ls --format "{{json .}}"');

                // Split by }{ pattern to handle concatenated JSON objects
                let jsonStrings = output.trim();
                if (jsonStrings.includes('}{')) {
                    jsonStrings = jsonStrings.replace(/\}\{/g, '}\n{');
                }

                const lines = jsonStrings.split('\n').filter(line => line.trim());
                const volumes = lines.map(line => {
                    try {
                        const parsed = JSON.parse(line.trim());
                        return {
                            Name: parsed.Name,
                            Driver: parsed.Driver,
                            Mountpoint: parsed.Mountpoint || '',
                            Labels: {},
                            Scope: parsed.Scope || 'local'
                        };
                    } catch (error) {
                        console.warn('Failed to parse volume line:', line, error);
                        return null;
                    }
                }).filter(v => v !== null);
                return volumes;
            }

            const volumes = await this.docker.listVolumes();
            return volumes.Volumes || [];
        } catch (error) {
            throw new Error(`Failed to get volumes: ${error.message}`);
        }
    }

    async removeVolume(name, force = false) {
        try {
            if (this.useWSL) {
                const forceFlag = force ? '-f' : '';
                console.log('WSL2 remove volume command:', `volume rm ${forceFlag} "${name}"`.trim());
                await this.executeWSLDockerCommand(`volume rm ${forceFlag} "${name}"`.trim());
                return { success: true, message: `Volume ${name} removed (WSL2)` };
            }

            const volume = this.docker.getVolume(name);
            await volume.remove({ force });
            return { success: true, message: `Volume ${name} removed` };
        } catch (error) {
            throw new Error(`Failed to remove volume ${name}: ${error.message}`);
        }
    }

    async getNetworks() {
        try {
            if (this.useWSL) {
                const output = await this.executeWSLDockerCommand('network ls --format "{{json .}}"');

                // Split by }{ pattern to handle concatenated JSON objects
                let jsonStrings = output.trim();
                if (jsonStrings.includes('}{')) {
                    jsonStrings = jsonStrings.replace(/\}\{/g, '}\n{');
                }

                const lines = jsonStrings.split('\n').filter(line => line.trim());
                const networks = lines.map(line => {
                    try {
                        const parsed = JSON.parse(line.trim());
                        return {
                            Id: parsed.ID,
                            Name: parsed.Name,
                            Driver: parsed.Driver,
                            Scope: parsed.Scope || 'local',
                            IPAM: { Config: [] },
                            Containers: {},
                            Options: {},
                            Labels: {}
                        };
                    } catch (error) {
                        console.warn('Failed to parse network line:', line, error);
                        return null;
                    }
                }).filter(n => n !== null);
                return networks;
            }

            const networks = await this.docker.listNetworks();
            return networks;
        } catch (error) {
            throw new Error(`Failed to get networks: ${error.message}`);
        }
    }

    async removeNetwork(id, force = false) {
        try {
            if (this.useWSL) {
                const forceFlag = force ? '-f' : '';
                console.log('WSL2 remove network command:', `network rm ${forceFlag} "${id}"`.trim());
                await this.executeWSLDockerCommand(`network rm ${forceFlag} "${id}"`.trim());
                return { success: true, message: `Network ${id} removed (WSL2)` };
            }

            const network = this.docker.getNetwork(id);
            await network.remove({ force });
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

    parseHumanBytes(h) {
        if (!h) return 0;
        const units = { b: 1, kb: 1024, kib: 1024, mb: 1024 * 1024, mib: 1024 * 1024, gb: 1024 * 1024 * 1024, gib: 1024 * 1024 * 1024 };
        const m = h.trim().match(/([\d.]+)\s*([a-zA-Z]+)/);
        if (!m) return parseFloat(h) || 0;
        const val = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        return Math.round(val * (units[unit] || 1));
    }

    /**
     * List all available WSL distros on the system.
     * @returns {Promise<string[]>} Array of distro names
     */
    static async listWslDistros() {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        try {
            // wsl.exe -l -q outputs UTF-16LE (UCS-2) encoded text by default
            const { stdout } = await execAsync('wsl.exe -l -q', { encoding: 'buffer' });
            // Decode buffer as utf16le
            const decoded = stdout.toString('utf16le');
            // Split by newlines, trim, and filter out empty lines
            return decoded.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        } catch (error) {
            throw new Error('Failed to list WSL distros: ' + error.message);
        }
    }
}

// Export both the class and a default singleton instance
module.exports = new DockerService();
module.exports.DockerService = DockerService;