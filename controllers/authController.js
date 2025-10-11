// controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', { 
    expiresIn: '30d' 
  });
};

// Client Register
const clientRegister = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { fullName, email, password, phone, company } = req.body;

    // Input validation
    if (!fullName || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Full name, email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
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

    // Generate token
    const token = generateToken(user._id);

    console.log('Registration successful for:', user.email);

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
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Client Login - FIXED with better error handling
const clientLogin = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email with timeout protection
    const user = await User.findOne({ email }).maxTimeMS(10000);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check password with timeout
    const isPasswordValid = await Promise.race([
      user.comparePassword(password),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Password check timeout')), 10000)
      )
    ]);

    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful for:', user.email);

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
    console.error('Login error:', error);
    
    if (error.message === 'Password check timeout') {
      return res.status(408).json({ 
        message: 'Login timeout. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Export all functions - FIXED: Uncommented exports
module.exports = {
  clientRegister,
  clientLogin
};