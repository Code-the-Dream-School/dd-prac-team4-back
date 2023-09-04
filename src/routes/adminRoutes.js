const express = require('express');
const router = express.Router();
const expressBasicAuth = require('express-basic-auth');
const adminController = require('../controllers/adminController');

// Middleware for Basic Authentication
router.use(
  expressBasicAuth({
    users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
    challenge: true, // Sends authentication challenge if credentials are not provided
    realm: 'admin site', // Authentication realm for the challenge
  })
);
/*
   #swagger.tags = ['Admin'] 
   #swagger.summary = 'Admin Login'
   #swagger.description = 'Authenticate as an admin to access the admin page.'
   #swagger.responses[200] = {
     description: 'Admin authenticated successfully.',
   }
   #swagger.responses[401] = {
     description: 'Authentication failed.',
   }
   */

router.get('/', adminController.adminHomePage);

router.route('/api/albums').patch(adminController.updatePriceOfAlbums);

module.exports = router;
