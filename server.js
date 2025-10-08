// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const quoteRoutes = require('./routes/quoteRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'], // Add your frontend domains
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes for admin access (temporary solution)
app.get('/api/public/quotes', async (req, res) => {
  try {
    const Quote = require('./models/quoteModel');
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
});

app.get('/api/public/messages', async (req, res) => {
  try {
    const Message = require('./models/messageModel');
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages.map(m => ({ 
      ...m.toObject(), 
      id: m._id.toString(),
      sentAt: m.createdAt
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch messages',
      error: error.message 
    });
  }
});

// Update quote status (public route for admin)
app.put('/api/public/quotes/:id/status', async (req, res) => {
  try {
    const Quote = require('./models/quoteModel');
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedQuote = await Quote.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!updatedQuote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    
    res.json({
      message: 'Quote status updated successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Update quote status error:', error);
    res.status(500).json({ 
      message: 'Failed to update quote status',
      error: error.message 
    });
  }
});

// Protected routes
app.use('/api/quotes', quoteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});