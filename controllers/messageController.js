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
    
    // FIXED: Include full URLs for files
    const messagesWithUrls = messages.map(message => {
      const messageObj = message.toObject();
      
      // Build full URLs for reply files
      if (messageObj.replyFiles && messageObj.replyFiles.length > 0) {
        messageObj.replyFiles = messageObj.replyFiles.map(file => {
          if (!file.startsWith('http')) {
            return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
          }
          return file;
        });
      }
      
      return {
        ...messageObj,
        id: message._id.toString(),
        sentAt: message.createdAt 
      };
    });
    
    res.json(messagesWithUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for specific client - FIXED with URL building
const getClientMessages = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Fetching messages for email:', email);
    const messages = await Message.find({ email }).sort({ createdAt: -1 });
    console.log('Found messages:', messages.length);

    const messagesWithId = messages.map(message => {
      const messageObj = message.toObject();
      
      // Build full URLs for reply files
      if (messageObj.replyFiles && messageObj.replyFiles.length > 0) {
        messageObj.replyFiles = messageObj.replyFiles.map(file => {
          if (!file.startsWith('http')) {
            return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
          }
          return file;
        });
      }
      
      return {
        ...messageObj,
        id: message._id.toString(),
        sentAt: message.createdAt
      };
    });

    res.json(messagesWithId);
  } catch (error) {
    console.error('Get client messages error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch client messages',
      error: error.message 
    });
  }
};

// Update message with admin reply - FIXED with proper file handling
const updateMessageReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    console.log('Updating message:', id);
    console.log('Uploaded files:', req.files);

    const updateData = {
      adminReply,
      status: 'replied',
      repliedAt: new Date()
    };

    // FIXED: Handle file uploads properly - check for files array
    if (req.files && req.files.length > 0) {
      updateData.replyFiles = req.files.map(file => `/uploads/${file.filename}`);
      console.log('Added reply files:', updateData.replyFiles);
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Build full URLs for response
    const responseMessage = updatedMessage.toObject();
    if (responseMessage.replyFiles && responseMessage.replyFiles.length > 0) {
      responseMessage.replyFiles = responseMessage.replyFiles.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }

    res.json({
      message: 'Reply sent successfully',
      updatedMessage: {
        ...responseMessage,
        id: updatedMessage._id.toString()
      }
    });
  } catch (error) {
    console.error('Update message reply error:', error);
    res.status(500).json({ 
      message: 'Failed to update message reply',
      error: error.message 
    });
  }
};

// Export all functions
module.exports = {
  createMessage,
  getMessages,
  getClientMessages,
  updateMessageReply
};