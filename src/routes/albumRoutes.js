const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createAlbum,
  updateAlbum,
  getAllAlbums,
  getSingleAlbum,
  getAlbumById,
} = require('../controllers/albumController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('admin'), createAlbum) //only admin can create product
  .get(getAllAlbums); //everyone can access all products- no middleware

router
  .route('/:id')
  .get(getSingleAlbum) //everyone can access all products- no middleware
  .patch(authenticateUser, authorizePermissions('admin'), updateAlbum); //only admin can update product

// Endpoint to retrieve an album by id
router.route('/:id').get(getAlbumById);

module.exports = router;
