// models/messageModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: { // CHANGED: from userEmail to email
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
  status: {
    type: String,
    enum: ['pending', 'replied', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ status: 1 });

module.exports = mongoose.model('Message', messageSchema);