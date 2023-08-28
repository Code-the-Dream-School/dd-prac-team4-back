const express = require('express');
const router = express.Router();
const expressBasicAuth = require('express-basic-auth');
const adminController = require('../controllers/adminController');

router.use(
  expressBasicAuth({
    users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
    challenge: true,
    realm: 'admin site',
  })
);

router.get('/', adminController.adminHomePage);

router
  .route('/api/albums')
  .patch(adminController.updatePriceOfAlbums);

module.exports = router;
