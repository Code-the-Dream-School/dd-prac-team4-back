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
    userId: {
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

//console.log('Schema Created');

// Creating a virtual field "album" that references the Album model
chatMessageSchema.virtual('album', {
  ref: 'Album', // Reference to the Album model
  localField: 'albumId', // Local field for the relationship
  foreignField: 'spotify_id', // Foreign field for the relationship
  justOne: true, // Refers to a single album
});

//console.log('Virtual Field "album" Created');

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

console.log('ChatMessage Model Created');

module.exports = ChatMessage;
