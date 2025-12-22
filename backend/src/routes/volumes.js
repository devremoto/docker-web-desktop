
const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');
const { DockerService } = require('../services/dockerService');



// Get all volumes
router.get('/', async (req, res) => {
    /* #swagger.tags = ['Volumes'] */
    /* #swagger.path = '/volumes/' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const volumes = await serviceInstance.getVolumes();
        res.json(volumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Remove volume
router.delete('/:name', async (req, res) => {
    /* #swagger.tags = ['Volumes'] */
    /* #swagger.path = '/volumes/{name}' */
    try {
        const force = req.query.force === 'true';
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.removeVolume(req.params.name, force);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('volumeRemoved', { name: req.params.name });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;