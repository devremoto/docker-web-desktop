const express = require('express');
const { DockerService } = require('../services/dockerService');

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
    /* #swagger.tags = ['Services'] */
    /* #swagger.path = '/services/' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const services = await serviceInstance.docker.listServices();
        res.json(services);
    } catch (error) {
        console.error('Error listing services:', error);
        res.status(500).json({
            error: 'Failed to list services',
            message: error.message
        });
    }
});

// Get specific service by ID or name
router.get('/:id', async (req, res) => {
    /* #swagger.tags = ['Services'] */
    /* #swagger.path = '/services/{id}' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const service = serviceInstance.docker.getService(req.params.id);
        const serviceInfo = await service.inspect();
        res.json(serviceInfo);
    } catch (error) {
        console.error('Error getting service:', error);
        res.status(500).json({
            error: 'Failed to get service information',
            message: error.message
        });
    }
});

// Remove service
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Services'] */
    /* #swagger.path = '/services/{id}' */
    try {
        const source = req.query.source || 'local';
        const wslDistro = req.query.wslDistro || undefined;
        const serviceInstance = new DockerService({ source, wslDistro });
        const result = await serviceInstance.removeService(req.params.id);

        // Emit real-time update
        const io = req.app.get('io');
        io.emit('serviceRemoved', { id: req.params.id });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;