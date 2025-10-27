const express = require('express');
const { 
  createQuote, 
  getQuotes, 
  updateQuoteStatus,
  getClientQuotes,
  acceptQuote,
  declineQuote
} = require('../controllers/quoteController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { uploadFields, uploadReplyFiles } = require('../middleware/upload');

const router = express.Router();

// Public routes - FIXED: Use uploadFields for multiple file types (payment screenshot optional)
router.post('/', uploadFields, createQuote);

// Protected routes - ADMIN only for all quotes
router.get('/', authMiddleware, isAdmin, getQuotes);

// Protected routes - Client can access their own quotes
router.get('/client', authMiddleware, getClientQuotes);

// Protected routes - ADMIN only for status updates with file upload - FIXED: Use uploadReplyFiles
router.put('/:id/status', authMiddleware, isAdmin, uploadReplyFiles, updateQuoteStatus);

// NEW: Client accept/decline quote routes
router.put('/:id/accept', authMiddleware, uploadFields, acceptQuote);
router.put('/:id/decline', authMiddleware, declineQuote);

module.exports = router;