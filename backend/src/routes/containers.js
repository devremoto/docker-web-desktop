const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');

// Get all containers
router.get('/', async (req, res) => {
    try {
        const all = req.query.all === 'true';
        const containers = await dockerService.getContainers(all);
        res.json(containers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific container
router.get('/:id', async (req, res) => {
    try {
        const container = await dockerService.getContainer(req.params.id);
        res.json(container);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start container
router.post('/:id/start', async (req, res) => {
    try {
        const result = await dockerService.startContainer(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('containerStateChanged', { id: req.params.id, action: 'start' });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stop container
router.post('/:id/stop', async (req, res) => {
    try {
        const result = await dockerService.stopContainer(req.params.id);

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
    try {
        const force = req.query.force === 'true';
        const result = await dockerService.removeContainer(req.params.id, force);

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
    try {
        const tail = parseInt(req.query.tail) || 100;
        const logs = await dockerService.getContainerLogs(req.params.id, tail);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inspect container
router.get('/:id/inspect', async (req, res) => {
    try {
        const inspection = await dockerService.inspectContainer(req.params.id);
        res.json(inspection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get container stats
router.get('/:id/stats', async (req, res) => {
    try {
        const stats = await dockerService.getContainerStats(req.params.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get container files
router.get('/:id/files', async (req, res) => {
    try {
        const path = req.query.path || '/';
        const files = await dockerService.getContainerFiles(req.params.id, path);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download container file
router.get('/:id/files/download', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const fileStream = await dockerService.downloadContainerFile(req.params.id, filePath);
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
    try {
        const { command } = req.body;
        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        const result = await dockerService.execContainer(req.params.id, command);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restart container
router.post('/:id/restart', async (req, res) => {
    try {
        const result = await dockerService.restartContainer(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('containerStateChanged', { id: req.params.id, action: 'restart' });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;