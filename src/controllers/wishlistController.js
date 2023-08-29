const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');

// Add an album to a wishlist
async function createWishlist(userId) {
  const newWishlist = new Wishlist({
    user: userId,
    albums: [],
  });
  await newWishlist.save();
  return newWishlist;
}

async function addAlbumToWishlist(req, res) {
  const { wishlist_id, album_id } = req.params;
  console.log('Received request to add album to wishlist');
  if (
    !mongoose.Types.ObjectId.isValid(wishlist_id) ||
    !mongoose.Types.ObjectId.isValid(album_id)
  ) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  console.log('Updating wishlist to add album');

  let wishlist = await Wishlist.findOne({ _id: wishlist_id });

  if (!wishlist) {
    // Wishlist doesn't exist, create a new one
    wishlist = await createWishlist(req.user.userId);
  }

  wishlist = await Wishlist.findOneAndUpdate(
    { _id: wishlist._id },
    { $addToSet: { albums: album_id } },
    { new: true }
  ).populate('albums');

  res.json(wishlist);
}

// Remove an album from a wishlist
async function removeAlbumFromWishlist(req, res) {
  const { wishlist_id, album_id } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(wishlist_id) ||
    !mongoose.Types.ObjectId.isValid(album_id)
  ) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { _id: wishlist_id, user: req.user.userId },
    { $pull: { albums: album_id } },
    { new: true }
  ).populate('albums');

  if (!wishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  console.log('Album added to wishlist successfully');
  res.json(wishlist);
}

module.exports = {
  addAlbumToWishlist,
  removeAlbumFromWishlist,
  createWishlist,
};
