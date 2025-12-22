const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const containerRoutes = require('./routes/containers');
const imageRoutes = require('./routes/images');
const volumeRoutes = require('./routes/volumes');
const networkRoutes = require('./routes/networks');
const serviceRoutes = require('./routes/services');
const commandRoutes = require('./routes/commands');
const composeRoutes = require('./routes/compose');
const wslRoutes = require('./routes/wsl');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Swagger UI (development only)
if (process.env.NODE_ENV === 'development') {
    try {
        const swaggerUi = require('swagger-ui-express');
        const swaggerDocument = require('./swagger_output.json');
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            explorer: true,
            swaggerOptions: {
                docExpansion: 'none', // Collapse all by default
                tagsSorter: 'alpha', // Sort tags alphabetically
                operationsSorter: 'alpha',
            }
        }));
        console.log('Swagger UI available at /api-docs (development, swagger-autogen)');
    } catch (err) {
        console.warn('Swagger UI not available. Install swagger-ui-express and swagger-autogen to enable it.');
    }
}

// Routes
app.use('/api/containers', containerRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/volumes', volumeRoutes);
app.use('/api/networks', networkRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/compose', composeRoutes);
app.use('/api/wsl', wslRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Docker Web Desktop API is running' });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, () => {
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log(`Server is running on port ${PORT}`);
    //put the app link and swagger link here
    console.log(`API Endpoint: http://localhost:${PORT}/api`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log('server is running at: http://localhost:' + PORT);
});

module.exports = { app, io };