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
    enum: ['translation', 'interpretation', 'proofreading', 'localization', 'content-creation', 'certified', 'transcription', 'cv-support', 'mtpe', 'glossaries', 'back-translation', 'ai-translation', 'social-media', 'any-other-document']
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
  enum: ['pending', 'Catering', 'quoted', 'accepted', 'declined', 'inProgress', 'completed', 'cancelled'],
  default: 'pending'
},
  adminReply: {
    type: String,
    trim: true
  },
  price: {
    type: String,
    trim: true
  },
  estimatedTime: {
    type: String
  },
  replyFiles: [{
    type: String
  }],
  repliedAt: {
    type: Date
  },
  files: [{
    type: String
  }],
  paymentScreenshot: {
    type: String
  },
  acceptedAt: {
    type: Date
  },
  declinedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);