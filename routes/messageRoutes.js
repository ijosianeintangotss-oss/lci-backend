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

router.post('/', createMessage);
router.get('/', authMiddleware, getMessages);
router.get('/client', authMiddleware, getClientMessages);
router.put('/:id/reply', authMiddleware, updateMessageReply);

module.exports = router;