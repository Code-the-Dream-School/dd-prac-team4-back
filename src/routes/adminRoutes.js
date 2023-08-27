const express = require('express');
const router = express.Router();
const expressBasicAuth = require('express-basic-auth');
const adminController = require('../controllers/adminController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router.use(
  expressBasicAuth({
    users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
    challenge: true,
    realm: 'admin site',
  })
);


router
  .route('/admin/api/albums')
  .patch(authenticateUser, authorizePermissions('admin'), adminController.updatePriceOfAlbums);

module.exports = router;
