const express = require('express');
const { DockerService } = require('../services/dockerService');
const { exec } = require('child_process');
const router = express.Router();

router.get('/', async (req, res) => {
    /* #swagger.tags = ['WSL'] */
    /* #swagger.path = '/wsl/' */
    try {
        const distros = await DockerService.listWslDistros();
        console.log('Available WSL Distros:', distros);
        res.json(distros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    /* #swagger.tags = ['WSL'] */
    /* #swagger.path = '/wsl/{id}' */
    try {
        const id = req.params.id;
        const distros = await DockerService.listWslDistros();
        // distros is an array of strings, so just match by string equality
        const distro = distros.find(d => d === id);
        if (distro) {
            res.send(distro);
        } else {
            res.status(404).json({ error: 'Distro not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});



module.exports = router;