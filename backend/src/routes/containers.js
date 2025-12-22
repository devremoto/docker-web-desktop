const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');
const { DockerService } = require('../services/dockerService');

// Get all containers
router.get('/', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/' */
    try {
        console.log('GET /containers hit', {
            all: req.query.all,
            source: req.query.source,
            wslDistro: req.query.wslDistro
        });
        const all = req.query.all === 'true';
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const containers = await serviceInstance.getContainers(all);
        console.log('GET /containers result count:', containers.length);
        res.json(containers);
    } catch (error) {
        console.error('GET /containers error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific container
router.get('/:id', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const container = await serviceInstance.getContainer(req.params.id);
        res.json(container);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start container
router.post('/:id/start', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/start' */
    try {
        const source = req.query.source || req.body.source || 'local';
        const wslDistro = req.query.wslDistro || req.body.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.startContainer(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('containerStarted', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stop container
router.post('/:id/stop', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/stop' */
    try {
        const source = req.query.source || req.body.source || 'local';
        const wslDistro = req.query.wslDistro || req.body.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.stopContainer(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('containerStateChanged', { id: req.params.id, action: 'stop' });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove container
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}' */
    try {
        const force = req.query.force === 'true';
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.removeContainer(req.params.id, force);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('containerRemoved', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get container logs
router.get('/:id/logs', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/logs' */
    try {
        const tail = parseInt(req.query.tail) || 100;
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const logs = await serviceInstance.getContainerLogs(req.params.id, tail);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inspect container
router.get('/:id/inspect', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/inspect' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const inspection = await serviceInstance.inspectContainer(req.params.id);
        res.json(inspection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get container stats
router.get('/:id/stats', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/stats' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const stats = await serviceInstance.getContainerStats(req.params.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get container files
router.get('/:id/files', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/files' */
    try {
        const path = req.query.path || '/';
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const files = await serviceInstance.getContainerFiles(req.params.id, path);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download container file
router.get('/:id/files/download', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/files/download' */
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const fileStream = await serviceInstance.downloadContainerFile(req.params.id, filePath);
        const fileName = filePath.split('/').pop();

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        fileStream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Execute command in container
router.post('/:id/exec', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/exec' */
    try {
        const { command } = req.body;
        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }
        const source = req.query.source || req.body.source || 'local';
        const wslDistro = req.query.wslDistro || req.body.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.execContainer(req.params.id, command);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restart container
router.post('/:id/restart', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/{id}/restart' */
    try {
        const source = req.query.source || req.body.source || 'local';
        const wslDistro = req.query.wslDistro || req.body.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.restartContainer(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('containerStateChanged', { id: req.params.id, action: 'restart' });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint - test connection to different sources
router.get('/test/source', async (req, res) => {
    /* #swagger.tags = ['Containers'] */
    /* #swagger.path = '/containers/test/source' */
    try {
        const source = req.query.source || 'local';
        const serviceInstance = DockerService.forSource(source);
        const info = await serviceInstance.getSystemInfo();
        res.json({
            source,
            connected: true,
            dockerInfo: {
                Containers: info.Containers,
                ContainersRunning: info.ContainersRunning,
                ServerVersion: info.ServerVersion || 'Unknown'
            }
        });
    } catch (error) {
        res.status(500).json({
            source: req.query.source,
            connected: false,
            error: error.message
        });
    }
});

module.exports = router;