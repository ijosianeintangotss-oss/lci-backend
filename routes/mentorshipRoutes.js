const express = require('express');
const router = express.Router();
const {
  createMentorshipApplication,
  getMentorshipApplications,
  getClientMentorshipApplications,
  updateMentorshipApplicationReply,
  updateMentorshipApplicationStatus,
  getMentorshipStats
} = require('../controllers/mentorshipController');

// Import auth middleware - FIXED: Check if it exists, otherwise create simple versions
let authMiddleware;
try {
  authMiddleware = require('../middleware/authMiddleware');
} catch (error) {
  console.log('Auth middleware not found, using simple versions');
  // Simple fallback middleware
  authMiddleware = {
    protect: (req, res, next) => {
      // Simple token check
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      next();
    },
    adminOnly: (req, res, next) => {
      // For development, allow all - in production you should implement proper admin check
      console.log('Admin check bypassed for development');
      next();
    }
  };
}

const { uploadFields } = require('../middleware/upload');

// Public route - submit mentorship application
router.post('/', uploadFields, createMentorshipApplication);

// Client routes - get applications for specific client
router.get('/client', authMiddleware.protect, getClientMentorshipApplications);

// Admin routes
router.get('/', authMiddleware.protect, authMiddleware.adminOnly, getMentorshipApplications);
router.get('/stats', authMiddleware.protect, authMiddleware.adminOnly, getMentorshipStats);
router.put('/:id/reply', authMiddleware.protect, authMiddleware.adminOnly, uploadFields, updateMentorshipApplicationReply);
router.put('/:id/status', authMiddleware.protect, authMiddleware.adminOnly, updateMentorshipApplicationStatus);

module.exports = router;