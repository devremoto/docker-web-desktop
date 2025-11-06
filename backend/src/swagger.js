const swaggerJSDoc = require('swagger-jsdoc');

const port = process.env.PORT || 3000;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Docker Web Desktop API',
            version: '1.0.0',
            description: 'API documentation for Docker Web Desktop (development only)'
        },
        servers: [
            {
                url: process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`
            }
        ]
    },
    // Look for JSDoc comments in route files — it's ok if routes don't have them yet.
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
