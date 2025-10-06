//controllers/quoteController.js
const Quote = require('../models/quoteModel');

exports.createQuote = async (req, res) => {
  try {
    const {
      fullName, email, phone, service, documentType,
      sourceLanguage, targetLanguage, urgency, wordCount, // ADDED urgency
      additionalRequirements, userId
    } = req.body;

    console.log('Received quote data:', {
      fullName, email, phone, service, documentType,
      sourceLanguage, targetLanguage, urgency, wordCount,
      additionalRequirements
    });

    // Validate required fields
    if (!urgency) {
      return res.status(400).json({ 
        message: 'Urgency field is required. Please select standard, urgent, or very-urgent.' 
      });
    }

    if (!service) {
      return res.status(400).json({ 
        message: 'Service field is required.' 
      });
    }

    // Validate service type
    const validServices = ['translation', 'interpretation', 'proofreading', 'localization', 'content-creation'];
    if (!validServices.includes(service)) {
      return res.status(400).json({ 
        message: `Invalid service type. Must be one of: ${validServices.join(', ')}` 
      });
    }

    // Validate urgency
    const validUrgencies = ['standard', 'urgent', 'very-urgent'];
    if (!validUrgencies.includes(urgency)) {
      return res.status(400).json({ 
        message: `Invalid urgency. Must be one of: ${validUrgencies.join(', ')}` 
      });
    }

    const files = req.files && req.files['files'] ? req.files['files'].map(file => `/uploads/${file.filename}`) : [];
    const paymentScreenshot = req.files && req.files['paymentScreenshot'] ? `/uploads/${req.files['paymentScreenshot'][0].filename}` : null;

    const newQuote = new Quote({
      fullName, 
      email,
      phone, 
      service, 
      documentType, 
      sourceLanguage,
      targetLanguage, 
      urgency, // ADDED urgency
      wordCount, 
      additionalNotes: additionalRequirements, // Mapping additionalRequirements to additionalNotes
      files, 
      paymentScreenshot, 
      status: 'pending', 
      userId
    });

    await newQuote.save();
    console.log('Quote saved successfully:', newQuote._id);
    
    res.status(200).json({ 
      message: 'Quote submitted successfully',
      quoteId: newQuote._id 
    });
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ 
      message: 'Failed to submit quote',
      error: error.message 
    });
  }
};

exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes.map(q => ({ ...q.toObject(), id: q._id.toString() })));
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch quotes',
      error: error.message 
    });
  }
};

exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply, price, estimatedTime } = req.body;
    
    const updateData = { status };
    if (adminReply !== undefined) updateData.adminReply = adminReply;
    if (price !== undefined) updateData.price = price;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;

    const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuote) return res.status(404).json({ message: 'Quote not found' });
    
    res.json({
      message: 'Quote updated successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Update quote status error:', error);
    res.status(500).json({ 
      message: 'Failed to update quote',
      error: error.message 
    });
  }
};

// Get quotes for specific client
exports.getClientQuotes = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Fetching quotes for email:', email);
    const quotes = await Quote.find({ email }).sort({ createdAt: -1 });
    console.log('Found quotes:', quotes.length);

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