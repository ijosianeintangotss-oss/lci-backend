// routes/quoteRoutes.js
const express = require('express');
const { 
  createQuote, 
  getQuotes, 
  updateQuoteStatus,
  getClientQuotes,
  getQuoteById
} = require('../controllers/quoteController');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', upload.fields([{ name: 'files' }, { name: 'paymentScreenshot' }]), createQuote);

// Protected routes
router.get('/', authMiddleware, getQuotes);
router.get('/client', authMiddleware, getClientQuotes);
router.get('/:id', authMiddleware, getQuoteById);
router.put('/:id/status', authMiddleware, upload.fields([{ name: 'replyFiles' }]), updateQuoteStatus);

module.exports = router;