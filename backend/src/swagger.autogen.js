const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Docker Web Desktop API',
        description: 'API documentation for Docker Web Desktop (auto-generated)'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    basePath: '/api',
    tags: [
        { name: 'Containers', description: 'Container operations' },
        { name: 'Images', description: 'Image operations' },
        { name: 'Volumes', description: 'Volume operations' },
        { name: 'Networks', description: 'Network operations' },
        { name: 'Services', description: 'Service operations' },
        { name: 'Commands', description: 'Command operations' },
        { name: 'Compose', description: 'Compose operations' },
        { name: 'WSL', description: 'WSL operations' },
    ]
};

const outputFile = './src/swagger_output.json';
const endpointsFiles = [
    './src/server.js',
    './src/routes/containers.js',
    './src/routes/images.js',
    './src/routes/volumes.js',
    './src/routes/networks.js',
    './src/routes/services.js',
    './src/routes/commands.js',
    './src/routes/compose.js',
    './src/routes/wsl.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc);
