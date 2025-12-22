const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');

// Convert Windows path to WSL path
function windowsToWslPath(windowsPath) {
    if (!windowsPath) return windowsPath;
    // Handle UNC paths and regular Windows paths
    const normalizedPath = windowsPath.replace(/\\/g, '/');
    // Match drive letter: C: → /mnt/c/
    const match = normalizedPath.match(/^([a-zA-Z]):/);
    if (match) {
        const drive = match[1].toLowerCase();
        const rest = normalizedPath.substring(2);
        return `/mnt/${drive}${rest}`;
    }
    return normalizedPath;
}

// Get docker-compose file content
router.post('/file', async (req, res) => {
    /* #swagger.tags = ['Compose'] */
    /* #swagger.path = '/compose/file' */
    try {
        const { projectName, workingDir, configFiles, source = 'local', wslDistro } = req.body;

        if (!projectName) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        let composeFilePath = null;
        let fileName = null;

        // For WSL2, convert Windows paths to WSL paths
        const searchDir = source === 'wsl2' && workingDir ? windowsToWslPath(workingDir) : workingDir;

        // First try to use the working directory and config files from labels
        if (searchDir && configFiles) {
            const configFilesList = configFiles.split(',');
            for (const configFile of configFilesList) {
                const basePath = path.isAbsolute(configFile) ? configFile : `${searchDir}/${configFile}`;
                const fullPath = source === 'wsl2' ? basePath : path.join(searchDir, configFile);
                try {
                    // For WSL2, use wsl to check if file exists
                    if (source === 'wsl2') {
                        const distro = wslDistro || process.env.WSL_DISTRO || 'Ubuntu';
                        await execAsync(`wsl.exe -d ${distro} -- test -f "${fullPath}"`);
                        composeFilePath = fullPath;
                        fileName = path.basename(configFile);
                    } else {
                        const stat = await fs.lstat(fullPath);
                        if (stat.isFile()) {
                            composeFilePath = fullPath;
                            fileName = path.basename(configFile);
                        }
                    }
                    if (composeFilePath) {
                        break;
                    }
                } catch (err) {
                    // File doesn't exist or not accessible, try next
                    continue;
                }
            }
        }

        // If not found, try common compose file names in working directory
        if (!composeFilePath && searchDir) {
            const commonNames = [
                'docker-compose.yml',
                'docker-compose.yaml',
                'compose.yml',
                'compose.yaml'
            ];

            for (const name of commonNames) {
                const fullPath = source === 'wsl2' ? `${searchDir}/${name}` : path.join(searchDir, name);
                try {
                    if (source === 'wsl2') {
                        const distro = wslDistro || process.env.WSL_DISTRO || 'Ubuntu';
                        await execAsync(`wsl.exe -d ${distro} -- test -f "${fullPath}"`);
                        composeFilePath = fullPath;
                        fileName = name;
                    } else {
                        const stat = await fs.lstat(fullPath);
                        if (stat.isFile()) {
                            composeFilePath = fullPath;
                            fileName = name;
                        }
                    }
                    if (composeFilePath) {
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }
        }

        // If still not found, try to find in current working directory
        if (!composeFilePath) {
            const commonNames = [
                'docker-compose.yml',
                'docker-compose.yaml',
                'compose.yml',
                'compose.yaml'
            ];

            for (const name of commonNames) {
                const fullPath = path.join(process.cwd(), name);
                try {
                    const stat = await fs.lstat(fullPath);
                    if (stat.isFile()) {
                        composeFilePath = fullPath;
                        fileName = name;
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }
        }

        if (!composeFilePath) {
            return res.status(404).json({
                error: 'Docker compose file not found',
                details: `Searched for compose files for project: ${projectName}`,
                searchedPaths: workingDir ? [workingDir, process.cwd()] : [process.cwd()]
            });
        }

        let content;
        // Read the file content depending on source
        if (source === 'wsl2') {
            const distro = wslDistro || process.env.WSL_DISTRO || 'Ubuntu';
            // Use WSL to cat the file (supports /mnt/* paths)
            const { stdout } = await execAsync(`wsl.exe -d ${distro} -- cat "${composeFilePath}"`);
            content = stdout;
        } else {
            content = await fs.readFile(composeFilePath, 'utf-8');
        }

        res.json({
            fileName: fileName,
            filePath: composeFilePath,
            content: content,
            projectName: projectName
        });

    } catch (error) {
        console.error('Error reading compose file:', error);
        res.status(500).json({
            error: 'Failed to read compose file',
            details: error.message
        });
    }
});

// Get all compose projects
router.get('/', async (req, res) => {
    /* #swagger.tags = ['Compose'] */
    /* #swagger.path = '/compose/' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const projects = await serviceInstance.getComposeProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start compose project
router.post('/:project/start', async (req, res) => {
    /* #swagger.tags = ['Compose'] */
    /* #swagger.path = '/compose/{project}/start' */
    try {
        const source = req.query.source || req.body.source || 'local';
        const wslDistro = req.query.wslDistro || req.body.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.startComposeProject(req.params.project);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;