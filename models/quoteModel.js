// models/quoteModel.js
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true
  },
  service: {
    type: String,
    required: true,
    enum: ['translation', 'interpretation', 'proofreading', 'localization', 'content-creation', 'certified', 'transcription', 'cv-support', 'mtpe', 'glossaries', 'back-translation', 'ai-translation', 'social-media']
  },
  documentType: {
    type: String,
    required: true
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  urgency: {
    type: String,
    required: true,
    enum: ['standard', 'urgent', 'very-urgent']
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminReply: {
    type: String,
    trim: true
  },
  replyFiles: [{
    type: String
  }],
  price: {
    type: Number
  },
  estimatedTime: {
    type: String
  },
  repliedAt: {
    type: Date
  },
  files: [{
    type: String
  }],
  paymentScreenshot: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
quoteSchema.index({ email: 1, createdAt: -1 });
quoteSchema.index({ status: 1 });

module.exports = mongoose.model('Quote', quoteSchema);