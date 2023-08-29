const express = require('express');
const {
  addAlbumToWishlist,
  removeAlbumFromWishlist,
  createWishlist, // Import the createWishlist function
} = require('../controllers/wishlistController');

const router = express.Router();
router.post('/', createWishlist); // Create wishlist route

router.patch('/:wishlist_id/add_album/:album_id', addAlbumToWishlist);

router.patch('/:wishlist_id/remove_album/:album_id', removeAlbumFromWishlist);

module.exports = router;
