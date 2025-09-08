const express = require('express');
const { createQuote, getQuotes, updateQuoteStatus } = require('../controllers/quoteController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', upload.fields([{ name: 'files' }, { name: 'paymentScreenshot' }]), createQuote);
router.get('/', getQuotes);
router.put('/:id/status', updateQuoteStatus);

module.exports = router;
