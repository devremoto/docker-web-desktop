const express = require('express');
const { exec } = require('child_process');
const https = require('https');
const router = express.Router();

function sanitize(command) {
    // Ensure command is a string
    if (typeof command !== 'string') {
        throw new Error(`Invalid command format: expected string, got ${typeof command}`);
    }

    // Only split and take first part to prevent command injection with && or ; or |
    var result = command.split(/[&;|]/)[0].trim();

    if (!result.startsWith('docker')) {
        throw new Error('Only Docker commands are allowed. Commands must start with "docker".');
    }
    return result;
}
// Execute Docker command
router.post('/execute', async (req, res) => {
    /* #swagger.tags = ['Commands'] */
    /* #swagger.path = '/commands/execute' */
    try {
        const { command, source = 'local', wslDistro } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        // Validate command is a string
        if (typeof command !== 'string') {
            return res.status(400).json({
                error: 'Invalid command format',
                details: `Expected string, received ${typeof command}`,
                received: command
            });
        }

        // Basic security: only allow docker and docker-compose commands
        const sanitizedCommand = sanitize(command);

        // Wrap command with wsl.exe if source is wsl2
        let finalCommand = sanitizedCommand;
        if (source === 'wsl2') {
            const distro = wslDistro || process.env.WSL_DISTRO || 'Ubuntu';
            finalCommand = `wsl.exe -d ${distro} -- ${sanitizedCommand}`;
        }

        console.log(`Executing command (${source}): ${finalCommand}`);

        // Execute the command
        exec(finalCommand, { timeout: 30000 }, (error, stdout, stderr) => {
            if (error) {
                // Handle command execution errors
                const errorOutput = stderr || error.message;
                return res.json({
                    success: false,
                    command: sanitizedCommand,
                    output: errorOutput,
                    source: source,
                    timestamp: new Date().toISOString()
                });
            }

            // Successful execution
            const output = stdout || (stderr && stderr.trim() ? stderr : 'Command executed successfully');
            res.json({
                success: true,
                command: sanitizedCommand,
                output: output,
                source: source,
                timestamp: new Date().toISOString()
            });
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to execute command',
            details: error.message
        });
    }
});

router.post('/openconsole', async (req, res) => {
    /* #swagger.tags = ['Commands'] */
    /* #swagger.path = '/commands/openconsole' */
    try {
        const { command, source = 'local', wslDistro } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }
        const sanitizedCommand = sanitize(command);
        console.log(`Opening console for command: ${process.platform} - ${sanitizedCommand} (${source})`);

        let cmd;
        if (source === 'wsl2') {
            // Open WSL2 console with the command
            const distro = wslDistro || process.env.WSL_DISTRO || 'Ubuntu';
            cmd = `start wsl.exe -d ${distro} -- bash -c "${sanitizedCommand}; read -p 'Press Enter to exit...'"`;
            console.log(`WSL2 command: ${cmd}`);
        } else {
            // Open Windows console
            cmd = process.platform === 'win32' ? `start cmd.exe /k ${sanitizedCommand}` : `sh -- ${sanitizedCommand}`;
        }

        const child = exec(cmd, {
            detached: true,
            shell: true, // Required to use 'start' command directly
            stdio: 'ignore' // Detach stdio streams
        });

        res.json({
            success: true,
            message: `Opening console for: ${sanitizedCommand} (${source})`,
            source: source,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to open console',
            details: error.message
        });
    }
});

// Get Docker system info (useful for testing connectivity)
router.get('/info', async (req, res) => {
    /* #swagger.tags = ['Commands'] */
    /* #swagger.path = '/commands/info' */
    try {
        const source = req.query.source || 'local';
        const distro = req.query.wslDistro || process.env.WSL_DISTRO || 'Ubuntu';
        let infoCommand = 'docker info --format json';

        if (source === 'wsl2') {
            infoCommand = `wsl.exe -d ${distro} -- ${infoCommand}`;
        }

        exec(infoCommand, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({
                    error: 'Failed to get Docker info',
                    details: stderr || error.message,
                    source: source
                });
            }

            try {
                const info = JSON.parse(stdout);
                res.json({
                    success: true,
                    info: info,
                    source: source,
                    timestamp: new Date().toISOString()
                });
            } catch (parseError) {
                res.json({
                    success: true,
                    info: { raw: stdout },
                    source: source,
                    timestamp: new Date().toISOString()
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get system info',
            details: error.message
        });
    }
});

// Search Docker Hub for images
router.post('/search-image', (req, res) => {
    /* #swagger.tags = ['Commands'] */
    /* #swagger.path = '/commands/search-image' */
    console.log('Search image endpoint called with query:', req.body.q);

    try {
        const query = req.body.q;
        let sort = req.body.sort; // e.g., 'stars', 'name', etc.
        if (!sort) {
            sort = 'star_count';
        }
        const isOfficial = req.body.is_official; // boolean or string 'true'/'false'

        if (!query || query.length < 2) {
            console.log('Query too short or missing');
            return res.status(400).json({
                error: 'Query must be at least 2 characters',
                results: []
            });
        }

        // Build the Docker Hub API URL as a string
        const encodedQuery = encodeURIComponent(query);


        let urlString = `https://hub.docker.com/v2/search/repositories/?query=${encodedQuery}&page=1&page_size=25&sort=${encodeURIComponent(sort)}`;
        if (typeof isOfficial !== 'undefined') {
            urlString += `&is_official=${encodeURIComponent(isOfficial)}`;
        }

        console.log(`Searching Docker Hub for: ${query} with URL: ${urlString}`);


        // Use axios for the request to Docker Hub
        const axios = require('axios');
        axios.get(urlString, { timeout: 10000 })
            .then(response => {
                try {
                    const jsonData = response.data;

                    // Transform results to include relevant data
                    let results = (jsonData.results || []).map(repo => ({
                        name: repo.repo_name,
                        description: repo.short_description || '',
                        owner: repo.repo_owner || 'library',
                        star_count: repo.star_count || 0,
                        pull_count: repo.pull_count || 0,
                        is_official: repo.is_official || false,
                        is_automated: repo.is_automated || false
                    }));

                    // Filter by is_official if requested
                    if (typeof isOfficial !== 'undefined') {
                        const isOfficialBool = (isOfficial === true || isOfficial === 'true');
                        results = results.filter(r => r.is_official === isOfficialBool);
                    }

                    // Only sort by stars if no sort param is provided (for backward compatibility)
                    if (!sort) {
                        results = results.sort((a, b) => b.star_count - a.star_count);
                    }

                    console.log(`Found ${results.length} results for ${query}`);

                    res.json({
                        success: true,
                        results: results,
                        count: results.length,
                        timestamp: new Date().toISOString()
                    });
                } catch (parseError) {
                    console.error('Failed to parse Docker Hub response:', parseError.message);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Failed to parse Docker Hub response',
                            details: parseError.message,
                            results: []
                        });
                    }
                }
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.error('Docker Hub request timeout');
                    if (!res.headersSent) {
                        res.status(408).json({
                            error: 'Docker Hub search timeout',
                            details: 'Request took too long',
                            results: []
                        });
                    }
                } else {
                    console.error('Docker Hub API error:', error.message);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Failed to search Docker Hub',
                            details: error.message,
                            results: []
                        });
                    }
                }
            });

    } catch (error) {
        console.error('Search endpoint error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Search endpoint error',
                details: error.message,
                results: []
            });
        }
    }
});

// Search Docker Hub for image tags
router.get('/search-image-tags', (req, res) => {
    /* #swagger.tags = ['Commands'] */
    /* #swagger.path = '/commands/search-image-tags' */
    console.log('Search image tags endpoint called with image:', req.query.image);

    try {
        const imageName = req.query.image;

        if (!imageName || imageName.length === 0) {
            console.log('Image name missing');
            return res.status(400).json({
                error: 'Image name is required',
                results: []
            });
        }

        // Build the Docker Hub API URL for tags
        // Docker Hub API format: /v2/repositories/<namespace>/<image>/tags
        // If no namespace specified, use "library" (official images)
        const parts = imageName.split('/');
        let namespace, repo;

        if (parts.length > 1) {
            // Has namespace (e.g., "myuser/myimage")
            namespace = parts[0];
            repo = parts.slice(1).join('/');
        } else {
            // No namespace, use library for official images
            namespace = 'library';
            repo = imageName;
        }

        const encodedNamespace = encodeURIComponent(namespace);
        const encodedRepo = encodeURIComponent(repo);
        const urlString = `https://hub.docker.com/v2/repositories/${encodedNamespace}/${encodedRepo}/tags?page_size=100`;

        console.log(`Fetching tags for: ${imageName} with URL: ${urlString}`);

        // Use axios for the request to Docker Hub
        const axios = require('axios');
        axios.get(urlString, { timeout: 10000 })
            .then(response => {
                try {
                    const jsonData = response.data;

                    // Transform results to include relevant data
                    const results = (jsonData.results || []).map(tag => ({
                        name: tag.name,
                        last_updated: tag.last_updated || null,
                        last_updater_username: tag.last_updater_username || null
                    }));

                    console.log(`Found ${results.length} tags for ${imageName}`);

                    res.json({
                        success: true,
                        results: results,
                        count: results.length,
                        image: imageName,
                        timestamp: new Date().toISOString()
                    });
                } catch (parseError) {
                    console.error('Failed to parse Docker Hub tags response:', parseError.message);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Failed to parse Docker Hub tags response',
                            details: parseError.message,
                            results: []
                        });
                    }
                }
            })
            .catch(error => {
                if (error.code === 'ECONNABORTED') {
                    console.error('Docker Hub tags request timeout');
                    if (!res.headersSent) {
                        res.status(408).json({
                            error: 'Docker Hub tags search timeout',
                            details: 'Request took too long',
                            results: []
                        });
                    }
                } else {
                    console.error('Docker Hub API tags error:', error.message);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Failed to fetch tags from Docker Hub',
                            details: error.message,
                            results: []
                        });
                    }
                }
            });

    } catch (error) {
        console.error('Tags endpoint error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Tags endpoint error',
                details: error.message,
                results: []
            });
        }
    }
});

module.exports = router;