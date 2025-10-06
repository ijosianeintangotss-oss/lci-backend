// controllers/userController.js
const User = require('../models/userModel');
const Quote = require('../models/quoteModel');
const Message = require('../models/messageModel');

// Get all users (for admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    const usersWithId = users.map(user => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }));

    res.json(usersWithId);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

// Update user status (for admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id, 
      { 
        status,
        ...(status === 'approved' && { approvedAt: new Date() })
      }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Failed to update user status',
      error: error.message 
    });
  }
};

// Get user dashboard data - FIXED: Better error handling
exports.getUserDashboard = async (req, res) => {
  try {
    const userEmail = req.user.email; // Get email from authenticated user
    
    console.log('Fetching dashboard for authenticated user:', userEmail);

    // Get user details from authenticated user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Get user's quotes
    const quotes = await Quote.find({ email: userEmail }).sort({ createdAt: -1 });
    console.log('Found quotes:', quotes.length);
    
    // Get user's messages
    const messages = await Message.find({ email: userEmail }).sort({ createdAt: -1 });
    console.log('Found messages:', messages.length);

    const dashboardData = {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        status: user.status,
        createdAt: user.createdAt
      },
      quotes: quotes.map(quote => ({
        id: quote._id.toString(),
        service: quote.service,
        documentType: quote.documentType,
        sourceLanguage: quote.sourceLanguage,
        targetLanguage: quote.targetLanguage,
        wordCount: quote.wordCount,
        urgency: quote.urgency,
        additionalNotes: quote.additionalNotes,
        status: quote.status,
        adminReply: quote.adminReply,
        price: quote.price,
        estimatedTime: quote.estimatedTime,
        submittedAt: quote.createdAt,
        updatedAt: quote.updatedAt
      })),
      messages: messages.map(message => ({
        id: message._id.toString(),
        subject: message.subject,
        message: message.message,
        adminReply: message.adminReply,
        status: message.status,
        submittedAt: message.createdAt,
        updatedAt: message.updatedAt
      }))
    };

    console.log('Dashboard data prepared successfully for:', userEmail);
    res.json(dashboardData);

  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user dashboard data',
      error: error.message 
    });
  }
};