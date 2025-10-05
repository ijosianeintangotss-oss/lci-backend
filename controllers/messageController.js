const Message = require('../models/messageModel');

exports.createMessage = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ submittedAt: -1 });
    res.json(messages.map(m => ({ ...m.toObject(), id: m._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for specific client
exports.getClientMessages = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const messages = await Message.find({ email }).sort({ submittedAt: -1 });
    const messagesWithId = messages.map(message => ({
      ...message.toObject(),
      id: message._id.toString()
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

// Update message with admin reply
exports.updateMessageReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      id, 
      { adminReply }, 
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};