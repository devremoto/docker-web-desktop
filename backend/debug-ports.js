const Docker = require('dockerode');

async function debugPorts() {
    try {
        const docker = new Docker();
        const containers = await docker.listContainers({ all: true });

        if (containers.length > 0) {
            // Find the container with 8885 port mappings that user reported
            const container = containers.find(c => c.Ports && c.Ports.some(p => p.PublicPort === 8885)) ||
                containers.find(c => c.Ports && c.Ports.some(p => p.PublicPort)) ||
                containers[0];
            console.log('=== Container from listContainers ===');
            console.log('ID:', container.Id);
            console.log('Ports from listContainers:');
            console.log(JSON.stringify(container.Ports, null, 2));

            console.log('\n=== Container from inspect ===');
            const containerObj = docker.getContainer(container.Id);
            const inspectData = await containerObj.inspect();

            console.log('Ports from inspect (NetworkSettings.Ports):');
            console.log(JSON.stringify(inspectData.NetworkSettings.Ports, null, 2));

            console.log('\n=== Current backend merge result ===');
            const merged = {
                ...container,
                Labels: inspectData.Config.Labels || {},
                NetworkSettings: inspectData.NetworkSettings || {}
            };
            console.log('Final Ports after merge:');
            console.log(JSON.stringify(merged.Ports, null, 2));

            console.log('\n=== Checking if NetworkSettings has different Ports ===');
            console.log('NetworkSettings.Ports:');
            console.log(JSON.stringify(merged.NetworkSettings.Ports, null, 2));
        } else {
            console.log('No containers found');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugPorts();