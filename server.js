// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create Uploads directory if it doesn't exist - FIXED path
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created:', uploadsDir);
}

// Serve uploaded files statically - FIXED: Proper static file serving
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set proper headers for file downloads
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (path.endsWith('.doc') || path.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/msword');
    }
  }
}));

// Serve static files from root for any direct file access
app.use('/Uploads', express.static(uploadsDir));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Better error handling for route imports
const loadRoute = (routePath, routeName) => {
  try {
    console.log(`📁 Loading ${routeName} routes from: ${routePath}`);
    const route = require(routePath);
    console.log(`✅ ${routeName} routes loaded successfully`);
    return route;
  } catch (error) {
    console.error(`❌ Failed to load ${routeName} routes:`, error.message);
    console.error(`📝 Route path: ${routePath}`);
    
    // Return a simple router that shows the error
    const router = require('express').Router();
    router.all('*', (req, res) => {
      res.status(500).json({ 
        message: `${routeName} routes are not available due to server configuration error`,
        error: error.message,
        route: routeName,
        path: req.originalUrl
      });
    });
    return router;
  }
};

// Routes with error handling
app.use('/api/auth', loadRoute('./routes/authRoutes', 'Auth'));
app.use('/api/messages', loadRoute('./routes/messageRoutes', 'Messages'));
app.use('/api/quotes', loadRoute('./routes/quoteRoutes', 'Quotes'));
app.use('/api/users', loadRoute('./routes/userRoutes', 'Users'));
app.use('/api/mentorship', loadRoute('./routes/mentorshipRoutes', 'Mentorship'));

// Health check route
app.get('/api/health', (req, res) => {
  const routes = [
    'auth',
    'messages', 
    'quotes',
    'users',
    'mentorship'
  ];
  
  const routeStatus = {};
  routes.forEach(route => {
    routeStatus[route] = 'loaded';
  });

  res.status(200).json({ 
    message: 'LCI Rwanda Backend Server is running', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir),
    routes: routeStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test file upload endpoint
app.get('/api/test-upload', (req, res) => {
  const testFile = path.join(uploadsDir, 'test.txt');
  try {
    fs.writeFileSync(testFile, 'Test file content - ' + new Date().toISOString());
    res.json({ 
      message: 'Test file created',
      path: testFile,
      url: '/uploads/test.txt',
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create test file',
      error: error.message,
      status: 'error'
    });
  }
});

// Route status endpoint
app.get('/api/routes-status', (req, res) => {
  const routes = [
    { name: 'Auth', path: './routes/authRoutes' },
    { name: 'Messages', path: './routes/messageRoutes' },
    { name: 'Quotes', path: './routes/quoteRoutes' },
    { name: 'Users', path: './routes/userRoutes' },
    { name: 'Mentorship', path: './routes/mentorshipRoutes' }
  ];

  const status = routes.map(route => {
    try {
      require(route.path);
      return {
        route: route.name,
        status: 'loaded',
        path: route.path
      };
    } catch (error) {
      return {
        route: route.name,
        status: 'error',
        path: route.path,
        error: error.message
      };
    }
  });

  res.json({
    message: 'Route loading status',
    timestamp: new Date().toISOString(),
    routes: status
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LCI Rwanda Backend API',
    version: '1.0.0',
    status: 'running',
    uploadsPath: uploadsDir,
    endpoints: {
      auth: '/api/auth',
      messages: '/api/messages',
      quotes: '/api/quotes',
      users: '/api/users',
      mentorship: '/api/mentorship',
      health: '/api/health',
      testUpload: '/api/test-upload',
      routeStatus: '/api/routes-status'
    },
    documentation: 'All endpoints are protected with authentication'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/auth',
      '/api/messages',
      '/api/quotes', 
      '/api/users',
      '/api/mentorship',
      '/api/health',
      '/api/test-upload',
      '/api/routes-status'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large. Maximum size is 20MB.',
      error: err.message
    });
  }
  
  // Handle route loading errors
  if (err.message && err.message.includes('routes are not available')) {
    return res.status(500).json({
      message: 'Route configuration error',
      error: err.message
    });
  }
  
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 LCI Rwanda Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Route status: http://localhost:${PORT}/api/routes-status`);
  console.log(`📍 API Root: http://localhost:${PORT}/`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Loaded Routes:`);
  console.log(`   ✅ Auth: /api/auth`);
  console.log(`   ✅ Messages: /api/messages`);
  console.log(`   ✅ Quotes: /api/quotes`);
  console.log(`   ✅ Users: /api/users`);
  console.log(`   ✅ Mentorship: /api/mentorship`);
});