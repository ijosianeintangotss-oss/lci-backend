// controllers/messageController.js
const Message = require('../models/messageModel');

const createMessage = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;
    
    const newMessage = new Message({
      fullName,
      email,
      subject,
      message
    });
    
    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages.map(m => ({ 
      ...m.toObject(), 
      id: m._id.toString(),
      sentAt: m.createdAt 
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for specific client - FIXED: Ensure this function exists
const getClientMessages = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Fetching messages for email:', email);
    const messages = await Message.find({ email }).sort({ createdAt: -1 });
    console.log('Found messages:', messages.length);

    const messagesWithId = messages.map(message => ({
      ...message.toObject(),
      id: message._id.toString(),
      sentAt: message.createdAt
    }));

    res.json(messagesWithId);
  } catch (error) {
    console.error('Get client messages error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch client messages',
      error: error.message 
    });
  }
};

// Update message with admin reply - FIXED with file upload
const updateMessageReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const updateData = {
      adminReply,
      status: 'replied',
      repliedAt: new Date()
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updateData.replyFiles = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Reply sent successfully',
      updatedMessage: {
        ...updatedMessage.toObject(),
        id: updatedMessage._id.toString()
      }
    });
  } catch (error) {
    console.error('Update message reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export all functions - FIXED: Added exports
module.exports = {
  createMessage,
  getMessages,
  getClientMessages,
  updateMessageReply
};