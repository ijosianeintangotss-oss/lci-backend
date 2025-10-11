// routes/messageRoutes.js
const express = require('express');
const { 
  createMessage, 
  getMessages, 
  getClientMessages,
  updateMessageReply,
  getMessageById
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/', createMessage);

// Protected routes
router.get('/', authMiddleware, getMessages);
router.get('/client', authMiddleware, getClientMessages);
router.get('/:id', authMiddleware, getMessageById);
router.put('/:id/reply', authMiddleware, upload.fields([{ name: 'replyFiles' }]), updateMessageReply);

module.exports = router;