require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexsync';

// Route Handlers
const authRoutes = require('./routes/auth-routes');
const projectRoutes = require('./routes/project-routes');
const eventRoutes = require('./routes/event-routes');
const teamRoutes = require('./routes/team-routes');

// Allowed Origins for CORS (supports comma-separated list in CLIENT_URL for production)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed by CORS origin validation'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas / Local Instance');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });

// API Routes
app.use('/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/team', teamRoutes);

// Root endpoint info
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'NexSync Autonomous Mobility Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      team: '/api/team',
      projects: '/api/projects',
      events: '/api/events',
    },
  });
});

// Health check endpoint for Render / monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'NexSync Autonomous Mobility API',
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NexSync Server running on port ${PORT}`);
});
