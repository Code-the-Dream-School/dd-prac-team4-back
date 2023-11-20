const express = require('express');
const router = express.Router();
const fileUploadMiddleware = require('express-fileupload');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateCurrentUser,
  updateUserPassword,
  deleteSingleUser,
  getCurrentUserWithPurchasedAlbums,
} = require('../controllers/userController');
const imgurController = require('../controllers/imgurController');
// Define routes for handling user-related operations
router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers);

// - GET /: Retrieve all users (requires authentication and admin permission)

router.route('/showMe').get(authenticateUser, showCurrentUser);
// - GET /showMe: Retrieve the currently authenticated user's information

router
  .route('/showMe/withAlbums')
  .get(authenticateUser, getCurrentUserWithPurchasedAlbums);
//getting a user with their albums

router.route('/updateCurrentUser').patch(authenticateUser, updateCurrentUser);
// - PATCH /updateUser: Update the currently authenticated user's information

router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
// - PATCH /updateUserPasssword: Update the currently authenticated user's password

router.route('/:id').get(authenticateUser, getSingleUser);
// - GET /:id: Retrieve a single user's information by their ID (requires authentication)

router
  .route('/:id')
  .delete(authenticateUser, authorizePermissions('admin'), deleteSingleUser);

// Route for rendering the upload page
router.get('/:userId/upload', imgurController.renderUploadPage);

router.post(
  '/:userId/upload',
  fileUploadMiddleware({ limits: { fileSize: 10000000 }, abortOnLimit: true }),
  imgurController.uploadProfile
);

module.exports = router;
