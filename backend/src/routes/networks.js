const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');

// Get all networks
router.get('/', async (req, res) => {
    try {
        const networks = await dockerService.getNetworks();
        res.json(networks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove network
router.delete('/:id', async (req, res) => {
    try {
        const result = await dockerService.removeNetwork(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('networkRemoved', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;