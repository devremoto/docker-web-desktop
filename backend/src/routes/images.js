const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');

// Get all images
router.get('/', async (req, res) => {
    try {
        const images = await dockerService.getImages();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove image
router.delete('/:id', async (req, res) => {
    try {
        const force = req.query.force === 'true';
        const result = await dockerService.removeImage(req.params.id, force);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('imageRemoved', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;