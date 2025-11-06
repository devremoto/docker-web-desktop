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
    origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/containers', containerRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/volumes', volumeRoutes);
app.use('/api/networks', networkRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/commands', commandRoutes);

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
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io };