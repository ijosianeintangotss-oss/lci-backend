const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  service: { type: String, required: true },
  documentType: { type: String, required: true },
  sourceLanguage: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  turnaround: { type: String, required: true },
  wordCount: String,
  additionalRequirements: String,
  files: [String],
  paymentScreenshot: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending', enum: ['pending', 'inProgress', 'completed', 'cancelled'] },
});

quoteSchema.index({ submittedAt: -1 });
module.exports = mongoose.model('Quote', quoteSchema);
