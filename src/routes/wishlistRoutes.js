const express = require('express');
const { authenticateUser } = require('../middleware/authentication');
const {
  addAlbumToWishlist,
  removeAlbumFromWishlist,
  createWishlist, // Import the createWishlist function
} = require('../controllers/wishlistController');

const router = express.Router();
router.post('/', authenticateUser, createWishlist); // Create wishlist route

router.patch(
  '/:wishlist_id/add_album/:album_id',
  authenticateUser,
  addAlbumToWishlist
);

router.patch('/:wishlist_id/remove_album/:album_id', removeAlbumFromWishlist);

module.exports = router;
