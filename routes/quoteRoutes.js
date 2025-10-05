const express = require('express');
const { 
  createQuote, 
  getQuotes, 
  updateQuoteStatus,
  getClientQuotes 
} = require('../controllers/quoteController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', upload.fields([{ name: 'files' }, { name: 'paymentScreenshot' }]), createQuote);
router.get('/', getQuotes);
router.get('/client-quotes', getClientQuotes);
router.put('/:id/status', updateQuoteStatus);

module.exports = router;