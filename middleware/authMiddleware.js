// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Also check for token in other common locations
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied' 
      });
    }

    console.log('Token received:', token.substring(0, 20) + '...');

    // Check if it's an admin token (base64 encoded)
    if (token && token.length > 20) {
      try {
        // Try to decode as base64 (admin token)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        if (decoded.role === 'admin') {
          console.log('Admin token verified for:', decoded.email);
          req.user = {
            id: 'admin',
            email: decoded.email || 'admin@lcirwanda.com',
            role: 'admin',
            fullName: decoded.fullName || 'Administrator'
          };
          return next();
        }
      } catch (base64Error) {
        console.log('Not a base64 admin token, trying JWT...');
      }
    }

    // Try JWT token for regular users
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Decoded JWT token:', decoded);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for ID:', decoded.id);
        return res.status(401).json({ 
          message: 'Token is not valid - user not found' 
        });
      }

      // Check if user is approved
      if (user.status !== 'approved') {
        return res.status(403).json({ 
          message: 'Your account is pending approval' 
        });
      }

      console.log('User authenticated:', user.email);
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
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