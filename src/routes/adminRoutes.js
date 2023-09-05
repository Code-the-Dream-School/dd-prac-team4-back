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
/*
#swagger.tags = ['Admin']
#swagger.summary = 'Update prices of albums'
#swagger.description = 'Update prices of selected albums as an admin.'
#swagger.method = 'patch'
#swagger.path = '/admin/api/albums'
#swagger.parameters.albums = {
  in: 'body',
  description: 'Array of album updates',
  required: true,
  type: 'array',
  items: {
    type: 'object',
    id: { type: 'string', description: 'ID of the album to update' },
    price: { type: 'number', description: 'New price for the album' }
  }
  }
}
#swagger.responses[200] = {
  description: 'Albums prices were successfully updated.',
  schema: {
    type: 'object',
    albums: {
      type: 'array',
      description: 'Updated albums',
      items: { $ref: '#/definitions/Album' }
    }
  }
}
#swagger.responses[500] = {
  description: 'Internal server error.',
}
   */

module.exports = router;
