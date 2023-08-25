const express = require('express');
const {
  addAlbumToWishlist,
  removeAlbumFromWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

router.patch('/wishlist/:wishlist_id/add_album/:album_id', addAlbumToWishlist);

router.patch(
  '/wishlist/:wishlist_id/remove_album/:album_id',
  removeAlbumFromWishlist
);

module.exports = router;
