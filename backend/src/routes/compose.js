const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get docker-compose file content
router.post('/file', async (req, res) => {
    try {
        const { projectName, workingDir, configFiles } = req.body;

        if (!projectName) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        let composeFilePath = null;
        let fileName = null;

        // First try to use the working directory and config files from labels
        if (workingDir && configFiles) {
            const configFilesList = configFiles.split(',');
            for (const configFile of configFilesList) {
                const fullPath = path.isAbsolute(configFile) ? configFile : path.join(workingDir, configFile);
                try {
                    await fs.access(fullPath);
                    composeFilePath = fullPath;
                    fileName = path.basename(fullPath);
                    break;
                } catch (err) {
                    // File doesn't exist or not accessible, try next
                    continue;
                }
            }
        }

        // If not found, try common compose file names in working directory
        if (!composeFilePath && workingDir) {
            const commonNames = [
                'docker-compose.yml',
                'docker-compose.yaml',
                'compose.yml',
                'compose.yaml'
            ];

            for (const name of commonNames) {
                const fullPath = path.join(workingDir, name);
                try {
                    await fs.access(fullPath);
                    composeFilePath = fullPath;
                    fileName = name;
                    break;
                } catch (err) {
                    // File doesn't exist, try next
                    continue;
                }
            }
        }

        // If still not found, try to find in current working directory
        if (!composeFilePath) {
            const commonNames = [
                'docker-compose.yml',
                'docker-compose.yaml',
                'compose.yml',
                'compose.yaml'
            ];

            for (const name of commonNames) {
                const fullPath = path.join(process.cwd(), name);
                try {
                    await fs.access(fullPath);
                    composeFilePath = fullPath;
                    fileName = name;
                    break;
                } catch (err) {
                    // File doesn't exist, try next
                    continue;
                }
            }
        }

        if (!composeFilePath) {
            return res.status(404).json({
                error: 'Docker compose file not found',
                details: `Searched for compose files for project: ${projectName}`,
                searchedPaths: workingDir ? [workingDir, process.cwd()] : [process.cwd()]
            });
        }

        // Read the file content
        const content = await fs.readFile(composeFilePath, 'utf-8');

        res.json({
            fileName: fileName,
            filePath: composeFilePath,
            content: content,
            projectName: projectName
        });

    } catch (error) {
        console.error('Error reading compose file:', error);
        res.status(500).json({
            error: 'Failed to read compose file',
            details: error.message
        });
    }
});

module.exports = router;