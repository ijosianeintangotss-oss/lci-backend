const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  adminReply: {
    type: String,
    trim: true
  },
  replyFiles: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'replied', 'resolved'],
    default: 'pending'
  },
  repliedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);