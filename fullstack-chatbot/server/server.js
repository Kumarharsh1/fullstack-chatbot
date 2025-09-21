require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Add this
const redis = require('redis');
const { Pool } = require('pg');
const apiRoutes = require('./routes/api');
const { initializeVectorStore } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files - ADD THIS
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Fallback to serve React app - ADD THIS
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Initialize services
async function initializeServer() {
  try {
    // Initialize vector store
    await initializeVectorStore();
    
    console.log('Services initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

initializeServer();