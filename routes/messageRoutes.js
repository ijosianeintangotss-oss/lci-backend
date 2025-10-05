const express = require('express');
const { 
  createMessage, 
  getMessages, 
  getClientMessages,
  updateMessageReply 
} = require('../controllers/messageController');

const router = express.Router();

router.post('/', createMessage);
router.get('/', getMessages);
router.get('/client-messages', getClientMessages);
router.put('/:id/reply', updateMessageReply);

module.exports = router;