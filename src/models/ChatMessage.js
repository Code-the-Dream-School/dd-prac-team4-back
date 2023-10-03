const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    album: {
      type: mongoose.Schema.ObjectId,
      ref: 'Album',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    capped: { size: 102400, max: 50 }, // max 50 messages
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
