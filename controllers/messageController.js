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
