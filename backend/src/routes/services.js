const express = require('express');
const Docker = require('dockerode');

const router = express.Router();
const docker = new Docker();

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await docker.listServices();
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
    try {
        const service = docker.getService(req.params.id);
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

module.exports = router;