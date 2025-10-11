// routes/quoteRoutes.js
const express = require('express');
const { 
  createQuote, 
  getQuotes, 
  updateQuoteStatus,
  getClientQuotes 
} = require('../controllers/quoteController');
const upload = require('../middleware/upload');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', upload.fields([{ name: 'files' }, { name: 'paymentScreenshot' }]), createQuote);

// Protected routes - ADMIN only for all quotes
router.get('/', authMiddleware, isAdmin, getQuotes);

// Protected routes - Client can access their own quotes
router.get('/client', authMiddleware, getClientQuotes);

// Protected routes - ADMIN only for status updates with file upload
router.put('/:id/status', authMiddleware, isAdmin, upload.array('replyFiles'), updateQuoteStatus);

module.exports = router;