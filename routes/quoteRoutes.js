// routes/quoteRoutes.js
const express = require('express');
const { 
  createQuote, 
  getQuotes, 
  updateQuoteStatus,
  getClientQuotes 
} = require('../controllers/quoteController');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', upload.fields([{ name: 'files' }, { name: 'paymentScreenshot' }]), createQuote);

// Protected routes
router.get('/', authMiddleware, getQuotes);
router.get('/client', authMiddleware, getClientQuotes);
router.put('/:id/status', authMiddleware, updateQuoteStatus);

module.exports = router;