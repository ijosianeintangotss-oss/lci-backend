// controllers/quoteController.js
const Quote = require('../models/quoteModel');

const createQuote = async (req, res) => {
  try {
    const {
      fullName, email, phone, service, documentType,
      sourceLanguage, targetLanguage, urgency, wordCount,
      additionalRequirements, userId
    } = req.body;

    console.log('Received quote data:', {
      fullName, email, phone, service, documentType,
      sourceLanguage, targetLanguage, urgency, wordCount,
      additionalRequirements
    });

    // Map frontend urgency values to backend values
    const urgencyMap = {
      'rush': 'very-urgent',
      'standard': 'standard',
      'extended': 'standard'
    };

    const backendUrgency = urgencyMap[urgency] || 'standard';

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

    // Validate service type - expanded to match frontend services
    const validServices = [
      'translation', 'interpretation', 'proofreading', 'localization', 'content-creation',
      'certified', 'transcription', 'cv-support', 'mtpe', 'glossaries', 
      'back-translation', 'ai-translation', 'social-media', 'any-other-document'
    ];
    
    if (!validServices.includes(service)) {
      return res.status(400).json({ 
        message: `Invalid service type. Must be one of: ${validServices.join(', ')}` 
      });
    }

    // Validate urgency
    const validUrgencies = ['standard', 'urgent', 'very-urgent'];
    if (!validUrgencies.includes(backendUrgency)) {
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
      urgency: backendUrgency,
      wordCount: wordCount || 0, 
      additionalNotes: additionalRequirements,
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

const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes.map(q => ({ 
      ...q.toObject(), 
      id: q._id.toString(),
      submittedAt: q.createdAt
    })));
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch quotes',
      error: error.message 
    });
  }
};

// Update quote with admin reply - FIXED with file upload
const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply, price, estimatedTime } = req.body;
    
    const updateData = { 
      status,
      repliedAt: new Date()
    };
    
    if (adminReply !== undefined) updateData.adminReply = adminReply;
    if (price !== undefined) updateData.price = price;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updateData.replyFiles = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuote) return res.status(404).json({ message: 'Quote not found' });
    
    res.json({
      message: 'Quote updated successfully',
      quote: {
        ...updatedQuote.toObject(),
        id: updatedQuote._id.toString()
      }
    });
  } catch (error) {
    console.error('Update quote status error:', error);
    res.status(500).json({ 
      message: 'Failed to update quote',
      error: error.message 
    });
  }
};

// Get quotes for specific client - FIXED: Ensure this function exists
const getClientQuotes = async (req, res) => {
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
      id: quote._id.toString(),
      submittedAt: quote.createdAt
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

// Export all functions - FIXED: Added exports
module.exports = {
  createQuote,
  getQuotes,
  updateQuoteStatus,
  getClientQuotes
};