// controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret-key', { 
    expiresIn: '30d' 
  });
};

// Client Registration
exports.clientRegister = async (req, res) => {
  try {
    console.log('📝 Registration request received');
    
    const { fullName, email, password, phone, company } = req.body;

    // Input validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Full name, email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      phone: phone || '',
      company: company || '',
      role: 'client',
      status: 'approved'
    });

    await user.save();
    console.log('✅ User registered successfully:', user.email);

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      message: 'Registration successful',
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
    console.error('❌ Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Client Login
exports.clientLogin = async (req, res) => {
  try {
    console.log('🔐 Login request received');
    
    const { email, password } = req.body;

    // Input validation
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

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful for:', user.email);

    // Send response
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
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};