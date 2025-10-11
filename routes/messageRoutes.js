// routes/messageRoutes.js
const express = require('express');
const { 
  createMessage, 
  getMessages, 
  getClientMessages,
  updateMessageReply 
} = require('../controllers/messageController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/', createMessage);

// Protected routes - ADMIN only for all messages
router.get('/', authMiddleware, isAdmin, getMessages);

// Protected routes - Client can access their own messages
router.get('/client', authMiddleware, getClientMessages);

// Protected routes - ADMIN only for replies with file upload
router.put('/:id/reply', authMiddleware, isAdmin, upload.array('replyFiles'), updateMessageReply);

module.exports = router;