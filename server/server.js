require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const authRoutes = require('./routes/auth-routes');
const appRoutes = require('./routes/project-application-routes');
const projectRoutes = require('./routes/project-routes');
const eventRoutes = require('./routes/event-routes');
const teamRoutes = require('./routes/team-routes');

cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
// Middleware
app.use(cors());
app.use(express.json());
// Database connection
mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

//routes configuration

app.use('/auth', authRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/team', teamRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
