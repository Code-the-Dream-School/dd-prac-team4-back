const express = require('express');
const Wishlist = require('../models/Wishlist');
const Album = require('../models/Album');
const router = express.Router();
const mongoose = require('mongoose');

router.patch('/wishlist/:wishlist_id/add_album/:album_id', addAlbumToWishlist);

router.patch(
  '/wishlist/:wishlist_id/remove_album/:album_id',
  async (req, res) => {
    const { wishlist_id, album_id } = req.params;

    try {
      if (
        !mongoose.Types.ObjectId.isValid(wishlist_id) ||
        !mongoose.Types.ObjectId.isValid(album_id)
      ) {
        return res.status(400).send('Invalid wishlist_id or album_id');
      }

      // Find the Wishlist document
      const wishlist = await Wishlist.findById(wishlist_id);

      // Check if wishlist exists
      if (!wishlist) {
        return res.status(404).send('Wishlist not found');
      }

      // Check if album is in wishlist
      if (!wishlist.albums.includes(album_id)) {
        return res.status(200).json(wishlist);
      }

      // Remove album from wishlist and save
      wishlist.albums.pull(album_id);
      await wishlist.save();

      return res.status(200).json(wishlist);
    } catch (error) {
      return res.status(500).send('Server error');
    }
  }
);

module.exports = router;
