const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    albumId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    user: {
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
    capped: { size: 102400, max: 1000 }, // max 1000 messages
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

console.log('ChatMessage Model Created');

module.exports = ChatMessage;
