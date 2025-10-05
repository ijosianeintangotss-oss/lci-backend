const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  adminReply: { type: String, default: '' },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  }
});

messageSchema.index({ submittedAt: -1 });
messageSchema.index({ email: 1 });
module.exports = mongoose.model('Message', messageSchema);