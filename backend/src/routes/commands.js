const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// Execute Docker command
router.post('/execute', async (req, res) => {
    try {
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        // Basic security: only allow docker and docker-compose commands
        const sanitizedCommand = command.trim();
        if (!sanitizedCommand.startsWith('docker')) {
            return res.status(400).json({
                error: 'Only Docker commands are allowed. Commands must start with "docker".'
            });
        }

        // Execute the command
        exec(sanitizedCommand, { timeout: 30000 }, (error, stdout, stderr) => {
            if (error) {
                // Handle command execution errors
                const errorOutput = stderr || error.message;
                return res.json({
                    success: false,
                    command: sanitizedCommand,
                    output: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }

            // Successful execution
            const output = stdout || (stderr && stderr.trim() ? stderr : 'Command executed successfully');
            res.json({
                success: true,
                command: sanitizedCommand,
                output: output,
                timestamp: new Date().toISOString()
            });
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to execute command',
            details: error.message
        });
    }
});

// Get Docker system info (useful for testing connectivity)
router.get('/info', async (req, res) => {
    try {
        exec('docker info --format json', { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({
                    error: 'Failed to get Docker info',
                    details: stderr || error.message
                });
            }

            try {
                const info = JSON.parse(stdout);
                res.json({
                    success: true,
                    info: info,
                    timestamp: new Date().toISOString()
                });
            } catch (parseError) {
                res.json({
                    success: true,
                    info: { raw: stdout },
                    timestamp: new Date().toISOString()
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get system info',
            details: error.message
        });
    }
});

module.exports = router;