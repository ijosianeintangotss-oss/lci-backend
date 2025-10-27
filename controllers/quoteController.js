const Quote = require('../models/quoteModel');
const path = require('path');
const fs = require('fs');

const createQuote = async (req, res) => {
  try {
    const {
      fullName, email, phone, service, serviceSubType, documentType,
      sourceLanguage, targetLanguage, urgency, wordCount,
      additionalRequirements, userId
    } = req.body;

    console.log('Received quote data:', {
      fullName, email, phone, service, serviceSubType, documentType,
      sourceLanguage, targetLanguage, urgency, wordCount,
      additionalRequirements
    });

    // Debug uploaded files
    console.log('Uploaded files:', req.files);

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

    // Validate service type
    const validServices = [
      'translation', 'interpretation', 'proofreading', 'localization', 'content-creation',
      'certified', 'transcription', 'cv-support', 'mtpe', 'glossaries', 
      'back-translation', 'ai-translation', 'social-media', 'any-other-document'
    ];
    
    if (!validServices.includes(service)) {
      return res.status(400).json({ 
        message: `Invalid service type: "${service}". Must be one of: ${validServices.join(', ')}` 
      });
    }

    // Validate urgency
    const validUrgencies = ['standard', 'urgent', 'very-urgent'];
    if (!validUrgencies.includes(backendUrgency)) {
      return res.status(400).json({ 
        message: `Invalid urgency. Must be one of: ${validUrgencies.join(', ')}` 
      });
    }

    // FIXED: Proper file handling - payment screenshot is now optional
    let files = [];
    let paymentScreenshot = null;

    if (req.files) {
      // Handle multiple files
      if (req.files['files']) {
        files = req.files['files'].map(file => `/uploads/${file.filename}`);
        console.log('Processed files:', files);
      }
      
      // Handle payment screenshot (optional)
      if (req.files['paymentScreenshot']) {
        paymentScreenshot = `/uploads/${req.files['paymentScreenshot'][0].filename}`;
        console.log('Payment screenshot:', paymentScreenshot);
      }
    }

    // Use custom document type if provided (for "Other" option), otherwise use serviceSubType
    const finalDocumentType = documentType || serviceSubType;

    const newQuote = new Quote({
      fullName, 
      email,
      phone, 
      service, 
      documentType: finalDocumentType, 
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
    console.log('✅ Quote saved successfully:', newQuote._id);
    console.log('📁 Attached files:', files);
    
    res.status(200).json({ 
      message: 'Quote submitted successfully',
      quoteId: newQuote._id,
      filesCount: files.length
    });
  } catch (error) {
    console.error('❌ Create quote error:', error);
    res.status(500).json({ 
      message: 'Failed to submit quote',
      error: error.message 
    });
  }
};

const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    
    // FIXED: Include full file URLs for ALL files (client-uploaded and admin-replied)
    const quotesWithUrls = quotes.map(quote => {
      const quoteObj = quote.toObject();
      
      // Build full URLs for client-uploaded files
      if (quoteObj.files && quoteObj.files.length > 0) {
        quoteObj.files = quoteObj.files.map(file => {
          // If file doesn't start with http, prepend base URL
          if (!file.startsWith('http')) {
            return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
          }
          return file;
        });
      }
      
      // Build full URL for payment screenshot
      if (quoteObj.paymentScreenshot && !quoteObj.paymentScreenshot.startsWith('http')) {
        quoteObj.paymentScreenshot = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${quoteObj.paymentScreenshot}`;
      }
      
      // Build full URLs for reply files (admin uploaded)
      if (quoteObj.replyFiles && quoteObj.replyFiles.length > 0) {
        quoteObj.replyFiles = quoteObj.replyFiles.map(file => {
          if (!file.startsWith('http')) {
            return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
          }
          return file;
        });
      }
      
      return {
        ...quoteObj,
        id: quote._id.toString(),
        submittedAt: quote.createdAt
      };
    });
    
    res.json(quotesWithUrls);
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch quotes',
      error: error.message 
    });
  }
};

// Update quote with admin reply - FIXED with proper FormData handling and currency support
// Update quote with admin reply - FIXED with proper FormData handling and currency support
const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply, price, estimatedTime } = req.body;
    
    console.log('Updating quote:', id);
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    const updateData = { 
      repliedAt: new Date()
    };
    
    // AUTO-SET STATUS: If price is provided and no explicit status is set, automatically set to "quoted"
    if (price !== undefined && price !== '' && !status) {
      updateData.status = 'quoted';
      console.log('Auto-setting status to "quoted" because price was provided');
    } else if (status) {
      updateData.status = status;
    }
    
    if (adminReply !== undefined) updateData.adminReply = adminReply;
    
    // Handle price with currency - FIXED: Parse from FormData
    if (price !== undefined && price !== '') {
      updateData.price = price; // This now includes currency (e.g., "100 USD" or "120000 RWF")
    }
    
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;

    // FIXED: Handle file uploads properly - check for files array
    if (req.files && req.files.length > 0) {
      updateData.replyFiles = req.files.map(file => `/uploads/${file.filename}`);
      console.log('Added reply files:', updateData.replyFiles);
    }

    const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    
    // Build full URLs for response - including client files
    const responseQuote = updatedQuote.toObject();
    
    // Build URLs for client-uploaded files
    if (responseQuote.files && responseQuote.files.length > 0) {
      responseQuote.files = responseQuote.files.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }
    
    // Build URLs for admin reply files
    if (responseQuote.replyFiles && responseQuote.replyFiles.length > 0) {
      responseQuote.replyFiles = responseQuote.replyFiles.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }
    
    res.json({
      message: 'Quote updated successfully',
      quote: {
        ...responseQuote,
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

// Get quotes for specific client - FIXED with URL building for ALL files
const getClientQuotes = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Fetching quotes for email:', email);
    const quotes = await Quote.find({ email }).sort({ createdAt: -1 });
    console.log('Found quotes:', quotes.length);

    const quotesWithId = quotes.map(quote => {
      const quoteObj = quote.toObject();
      
      // Build full URLs for client-uploaded files
      if (quoteObj.files && quoteObj.files.length > 0) {
        quoteObj.files = quoteObj.files.map(file => {
          if (!file.startsWith('http')) {
            return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
          }
          return file;
        });
      }
      
      // Build full URLs for payment screenshot
      if (quoteObj.paymentScreenshot && !quoteObj.paymentScreenshot.startsWith('http')) {
        quoteObj.paymentScreenshot = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${quoteObj.paymentScreenshot}`;
      }
      
      // Build full URLs for reply files (admin uploaded)
      if (quoteObj.replyFiles && quoteObj.replyFiles.length > 0) {
        quoteObj.replyFiles = quoteObj.replyFiles.map(file => {
          if (!file.startsWith('http')) {
            return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
          }
          return file;
        });
      }
      
      return {
        ...quoteObj,
        id: quote._id.toString(),
        submittedAt: quote.createdAt
      };
    });

    res.json(quotesWithId);
  } catch (error) {
    console.error('Get client quotes error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch client quotes',
      error: error.message 
    });
  }
};

// NEW: Accept quote and upload payment screenshot
const acceptQuote = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Accepting quote:', id);
    console.log('Uploaded files:', req.files);

    const updateData = { 
      status: 'accepted',
      acceptedAt: new Date()
    };
    
    // Handle payment screenshot upload
    if (req.files && req.files['paymentScreenshot']) {
      updateData.paymentScreenshot = `/uploads/${req.files['paymentScreenshot'][0].filename}`;
      console.log('Payment screenshot uploaded:', updateData.paymentScreenshot);
    }

    const updatedQuote = await Quote.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    
    // Build full URLs for response
    const responseQuote = updatedQuote.toObject();
    
    // Build URLs for client-uploaded files
    if (responseQuote.files && responseQuote.files.length > 0) {
      responseQuote.files = responseQuote.files.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }
    
    // Build URL for payment screenshot
    if (responseQuote.paymentScreenshot && !responseQuote.paymentScreenshot.startsWith('http')) {
      responseQuote.paymentScreenshot = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${responseQuote.paymentScreenshot}`;
    }
    
    // Build URLs for admin reply files
    if (responseQuote.replyFiles && responseQuote.replyFiles.length > 0) {
      responseQuote.replyFiles = responseQuote.replyFiles.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }
    
    res.json({
      message: 'Quote accepted successfully',
      quote: {
        ...responseQuote,
        id: updatedQuote._id.toString()
      }
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({ 
      message: 'Failed to accept quote',
      error: error.message 
    });
  }
};

// NEW: Decline quote
const declineQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedQuote = await Quote.findByIdAndUpdate(id, { 
      status: 'declined',
      declinedAt: new Date()
    }, { new: true });

    if (!updatedQuote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    
    // Build full URLs for response
    const responseQuote = updatedQuote.toObject();
    
    // Build URLs for client-uploaded files
    if (responseQuote.files && responseQuote.files.length > 0) {
      responseQuote.files = responseQuote.files.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }
    
    // Build URLs for admin reply files
    if (responseQuote.replyFiles && responseQuote.replyFiles.length > 0) {
      responseQuote.replyFiles = responseQuote.replyFiles.map(file => {
        if (!file.startsWith('http')) {
          return `${process.env.BASE_URL || 'https://apis.translatenexus.com'}${file}`;
        }
        return file;
      });
    }
    
    res.json({
      message: 'Quote declined successfully',
      quote: {
        ...responseQuote,
        id: updatedQuote._id.toString()
      }
    });
  } catch (error) {
    console.error('Decline quote error:', error);
    res.status(500).json({ 
      message: 'Failed to decline quote',
      error: error.message 
    });
  }
};

// Export all functions
module.exports = {
  createQuote,
  getQuotes,
  updateQuoteStatus,
  getClientQuotes,
  acceptQuote,
  declineQuote
};