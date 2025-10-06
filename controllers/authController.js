// controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token - FIXED: Use consistent payload
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', { 
    expiresIn: '30d' 
  });
};

// Client Registration
exports.clientRegister = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { fullName, email, password, phone, company } = req.body;

    // Check required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Full name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Create new user - SET STATUS TO APPROVED IMMEDIATELY
    const user = new User({
      fullName,
      email,
      password,
      phone: phone || '',
      company: company || '',
      role: 'client',
      status: 'approved', // Changed from 'pending' to 'approved'
      approvedAt: new Date() // Set approval date immediately
    });

    await user.save();
    console.log('User registered successfully:', user.email);

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful! You can now login to your client portal.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Client Login - REMOVED STATUS CHECK
exports.clientLogin = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // REMOVED STATUS CHECK - All users can login regardless of status

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('User logged in successfully:', user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Verify Token Middleware - REMOVED (using separate authMiddleware.js)