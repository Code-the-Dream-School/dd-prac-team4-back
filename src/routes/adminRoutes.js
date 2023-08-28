const express = require('express');
const router = express.Router();
const expressBasicAuth = require('express-basic-auth');
const adminController = require('../controllers/adminController');

// Middleware for Basic Authentication
router.use( 
  expressBasicAuth({
    users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
    challenge: true,  // Sends authentication challenge if credentials are not provided
    realm: 'admin site',  // Authentication realm for the challenge
  })
);

router.get('/', adminController.adminHomePage);

router
  .route('/api/albums')
  .patch(adminController.updatePriceOfAlbums);

module.exports = router;
