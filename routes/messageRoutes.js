// routes/messageRoutes.js
const express = require('express');
const { 
  createMessage, 
  getMessages, 
  getClientMessages,
  updateMessageReply 
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - for clients to send messages
router.post('/', createMessage);

// Protected routes - require authentication
router.get('/', authMiddleware, getMessages);
router.get('/client', authMiddleware, getClientMessages);
router.put('/:id/reply', authMiddleware, updateMessageReply);

module.exports = router;