const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');

// Get all volumes
router.get('/', async (req, res) => {
    try {
        const volumes = await dockerService.getVolumes();
        res.json(volumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove volume
router.delete('/:name', async (req, res) => {
    try {
        const result = await dockerService.removeVolume(req.params.name);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('volumeRemoved', { name: req.params.name });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;