const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

router.get('/:albumId', async (req, res) => {
  const { albumId } = req.params;
  const messages = await ChatMessage.find({ albumId })
    .sort({ timestamp: -1 }) // Sort messages in reverse chronological order
    .limit(50); // Limit 50 messages

  res.json({ messages });
});

module.exports = router;
