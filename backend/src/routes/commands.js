const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

function sanitize(command) {
    var result = command.split('&|;')[0].trim();
    if (!command.startsWith('docker')) {
        throw new Error('Only Docker commands are allowed. Commands must start with "docker".');
    }
    return result;
}
// Execute Docker command
router.post('/execute', async (req, res) => {
    try {
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        // Basic security: only allow docker and docker-compose commands
        const sanitizedCommand = sanitize(command);

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

router.post('/openconsole', async (req, res) => {
    try {
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }
        const sanitizedCommand = sanitize(command);
        //detect windows or linux
        console.log(`Opening console for command: ${process.platform } - ${sanitizedCommand}`);
        const cmd = process.platform === 'win32' ? `start cmd.exe /k ${sanitizedCommand}` : `sh -- ${sanitizedCommand}`;

        const child = exec(cmd, {
            detached: true,
            shell: true, // Required to use 'start' command directly
            stdio: 'ignore' // Detach stdio streams
        });

        res.json({
            success: true,
            message: `Opening console for container: ${sanitizedCommand}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to open console',
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