const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');
const { DockerService } = require('../services/dockerService');


// Get all networks
router.get('/', async (req, res) => {
    /* #swagger.tags = ['Networks'] */
    /* #swagger.path = '/networks/' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const networks = await serviceInstance.getNetworks();
        res.json(networks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Remove network
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Networks'] */
    /* #swagger.path = '/networks/{id}' */
    try {
        const force = req.query.force === 'true';
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.removeNetwork(req.params.id, force);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('networkRemoved', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;