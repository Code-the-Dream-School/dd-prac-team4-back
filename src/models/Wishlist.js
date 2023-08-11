const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model.
    required: true, //Checks if a user field is always provided when creating or updating a wishlist document.
  },
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId, //This specifies that each element in the albums array is an ObjectId.
      ref: 'Album', // Reference to the Album model
    },
  ],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
