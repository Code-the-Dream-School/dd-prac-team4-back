const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');

// Add an album to a wishlist
async function addAlbumToWishlist(req, res) {
  const { wishlist_id, album_id } = req.params;
  if (
    !mongoose.Types.ObjectId.isValid(wishlist_id) ||
    !mongoose.Types.ObjectId.isValid(album_id)
  ) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const wishlist = await Wishlist.findByIdAndUpdate(
    wishlist_id,
    { $addToSet: { albums: album_id } },
    { new: true }
  ).populate('albums');
  if (!wishlist) {
    return res.status(404).json({ error: 'Wishlist not found' });
  }
  res.json(wishlist);
}

// Remove an album from a wishlist
async function removeAlbumFromWishlist(req, res) {
  try {
    const { wishlist_id, album_id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(wishlist_id) ||
      !mongoose.Types.ObjectId.isValid(album_id)
    ) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const wishlist = await Wishlist.findByIdAndUpdate(
      wishlist_id,
      { $pull: { albums: album_id } },
      { new: true }
    ).populate('albums');

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Could not update wishlist' });
  }
}

module.exports = {
  addAlbumToWishlist,
  removeAlbumFromWishlist,
};
