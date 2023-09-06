const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

//Create wishlist
const createWishlist = async (req, res) => {
  const existingWishlist = await Wishlist.findOne({ user: req.user.userId })
    .populate('albums') // Populate the 'albums' field
    .exec();

  if (!existingWishlist) {
    const newWishlist = new Wishlist({
      user: req.user.userId,
      albums: req.body.albums || [], // start with an empty wishlist or with albums passed in from request
    });

    await newWishlist.save();
    await newWishlist.populate('albums');
    console.log(newWishlist);

    return res.status(StatusCodes.CREATED).json({ wishlist: newWishlist });
  }

  return res.status(StatusCodes.OK).json({ wishlist: existingWishlist });
};

//for admin - ability to get all wishlists
const getAllWishlists = async (req, res) => {
  const wishlists = await Wishlist.find({});
  res.status(StatusCodes.OK).json({ wishlists, count: wishlists.length });
};

//get single wishlist
const getSingleWishlist = async (req, res) => {
  const { id: wishlistId } = req.params;
  // Fetch the wishlist using the provided wishlistId and populate ALBUM information
  const wishlist = await Wishlist.findById(wishlistId).populate({
    path: 'albums',
  });

  if (!wishlist) {
    throw new CustomError.NotFoundError(`No wishlist with id ${wishlistId}`);
  }
  //uncoment LATER
  // checkPermissions(req.user, wishlist.user);

  res.status(StatusCodes.OK).json({ wishlist });
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
  console.log('Album removed from wishlist successfully');
  res.json(wishlist);
}

module.exports = {
  addAlbumToWishlist,
  removeAlbumFromWishlist,
  createWishlist,
  getAllWishlists,
  getSingleWishlist,
};
