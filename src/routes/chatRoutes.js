const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

router.get('/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params;
    const messages = await ChatMessage.find({ albumId })
      .sort({ timestamp: -1 }) // Sort messages in reverse chronological order
      .limit(50) // Limit 50 messages
      .exec(); // Execute the database query and retrieve the results

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
