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
  updatePriceOfAlbums,
  getFilteredAlbums,
} = require('../controllers/albumController');

router
  .route('/')
  .post(authenticateUser, authorizePermissions('admin'), createAlbum) //only admin can create product
  .get(getAllAlbums) //everyone can access all products- no middleware
  .patch(getAllAlbums,authenticateUser, authorizePermissions('admin'), updatePriceOfAlbums );


    router
    .get('/filter', getFilteredAlbums);

router
  .route('/:id')
  .get(getSingleAlbum) //everyone can access all products- no middleware
  .patch(authenticateUser, authorizePermissions('admin'), updateAlbum); //only admin can update product

module.exports = router;
