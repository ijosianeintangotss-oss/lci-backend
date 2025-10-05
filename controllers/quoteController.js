const Quote = require('../models/quoteModel');

exports.createQuote = async (req, res) => {
  try {
    const {
      fullName, email, phone, service, documentType,
      sourceLanguage, targetLanguage, turnaround, wordCount,
      additionalRequirements, userId
    } = req.body;

    const files = req.files['files'] ? req.files['files'].map(file => `/uploads/${file.filename}`) : [];
    const paymentScreenshot = req.files['paymentScreenshot'] ? `/uploads/${req.files['paymentScreenshot'][0].filename}` : null;

    const newQuote = new Quote({
      fullName, email, phone, service, documentType, sourceLanguage,
      targetLanguage, turnaround, wordCount, additionalRequirements,
      files, paymentScreenshot, status: 'pending', userId
    });

    await newQuote.save();
    res.status(200).json({ message: 'Quote submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ submittedAt: -1 });
    res.json(quotes.map(q => ({ ...q.toObject(), id: q._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;
    
    const updateData = { status };
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply;
    }

    const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuote) return res.status(404).json({ message: 'Quote not found' });
    res.json(updatedQuote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quotes for specific client
exports.getClientQuotes = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const quotes = await Quote.find({ email }).sort({ submittedAt: -1 });
    const quotesWithId = quotes.map(quote => ({
      ...quote.toObject(),
      id: quote._id.toString()
    }));

    res.json(quotesWithId);
  } catch (error) {
    console.error('Get client quotes error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch client quotes',
      error: error.message 
    });
  }
};