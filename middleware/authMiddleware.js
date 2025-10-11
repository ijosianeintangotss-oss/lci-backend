// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied' 
      });
    }

    console.log('Token received:', token.substring(0, 20) + '...');

    // Check if it's an admin token (base64 encoded)
    if (token.length > 100) {
      try {
        // Try to decode as base64 (admin token)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        if (decoded.role === 'admin') {
          console.log('Admin token verified');
          req.user = {
            id: 'admin',
            email: 'admin@lcirwanda.com',
            role: 'admin',
            fullName: 'Administrator'
          };
          return next();
        }
      } catch (base64Error) {
        console.log('Not a base64 admin token, trying JWT...');
      }
    }

    // Use the same secret as in authController
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded JWT token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ 
        message: 'Token is not valid - user not found' 
      });
    }

    console.log('User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      message: 'Token is not valid',
      error: error.message 
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin role required.' 
    });
  }
};

module.exports = { authMiddleware, isAdmin };