const mongoose = require('mongoose');

const mentorshipApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  portfolio: {
    type: String,
    trim: true
  },
  languages: [{
    language: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true
    },
    focusArea: {
      type: String
    }
  }],
  tools: [{
    type: String
  }],
  experience: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  motivation: {
    type: String,
    required: true
  },
  cv: {
    filename: String,
    path: String,
    originalName: String
  },
  coverLetter: {
    filename: String,
    path: String,
    originalName: String
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'accepted', 'rejected', 'interview_scheduled'],
    default: 'pending'
  },
  adminReply: {
    type: String,
    trim: true
  },
  replyFiles: [{
    filename: String,
    path: String,
    originalName: String
  }],
  repliedAt: {
    type: Date
  },
  estimatedTime: {
    type: String
  },
  nextSteps: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
mentorshipApplicationSchema.index({ email: 1, createdAt: -1 });
mentorshipApplicationSchema.index({ status: 1 });

const MentorshipApplication = mongoose.model('MentorshipApplication', mentorshipApplicationSchema);

module.exports = MentorshipApplication;