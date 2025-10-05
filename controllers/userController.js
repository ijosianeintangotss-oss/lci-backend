const User = require('../models/userModel');

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