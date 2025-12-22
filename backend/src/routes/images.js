

const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');
const { DockerService } = require('../services/dockerService');

// Get all images
router.get('/', async (req, res) => {
    /* #swagger.tags = ['Images'] */
    /* #swagger.path = '/images/' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const images = await serviceInstance.getImages();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove image
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Images'] */
    /* #swagger.path = '/images/{id}' */
    try {
        const force = req.query.force === 'true';
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.removeImage(req.params.id, force);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('imageRemoved', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;