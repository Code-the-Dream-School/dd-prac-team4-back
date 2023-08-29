const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const { StatusCodes } = require('http-status-codes');

//Create wishlist
const createWishlist = async (req, res) => {
  const { albumId } = req.body; //frontend sends the albumId in the request body

  const existingWishlist = await Wishlist.findOne({ user: req.user.userId });

  if (!existingWishlist) {
    const newWishlist = new Wishlist({
      user: req.user.userId,
      albums: [albumId],
    });
    await newWishlist.save();
    return res.status(StatusCodes.CREATED).json({ wishlist: newWishlist });
  }

  if (existingWishlist.albums.includes(albumId)) {
    console.log(`Album ${albumId} is already in the wishlist.`);
    return res.status(StatusCodes.OK).json({ wishlist: existingWishlist });
  }

  existingWishlist.albums.push(albumId);
  await existingWishlist.save();
  return res.status(StatusCodes.OK).json({ wishlist: existingWishlist });
};

// Add an album to a wishlist
async function addAlbumToWishlist(req, res) {
  const { wishlist_id, album_id } = req.params;
  if (
    !mongoose.Types.ObjectId.isValid(wishlist_id) ||
    !mongoose.Types.ObjectId.isValid(album_id)
  ) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const wishlist = await Wishlist.findOneAndUpdate(
    { _id: wishlist_id, user: req.user.userId },
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
