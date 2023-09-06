const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  const allAlbums = await Album.find({}).sort({ price: 1 }); // Fetch all albums from the database and sort them by price in ascending order
  res.render('adminPage', { albums: allAlbums });
  /*
  #swagger.tags = ['Admin']
  #swagger.summary = 'Admin Home Page'
  #swagger.description = 'Fetch and render the admin home page.'
  #swagger.responses[200] = {
    description: 'Admin home page fetched successfully.',
    content: { 'text/html': {} }
  }
*/
};

const {
  updatePriceOfAlbums: originalUpdatePrice,
} = require('../controllers/albumController');
const updatePriceOfAlbums = async (req, res) => {
  /*#swagger.summary = 'Update prices of albums passed in req.body'
	#swagger.requestBody = {
    required: true,
      "@content": {
      "application/json": {
      "schema": [{ "$ref": "#/definitions/UpdatePriceOfAlbums" }]
      }
    }
  }
  #swagger.responses[200] = {
    description: 'Album prices were successfully updated.',
    content: {
      'application/json': {
        schema: { album: { $ref: '#/definitions/Album' } }
      }
    }
  }
*/
  await originalUpdatePrice(req, res);
};

module.exports = {
  adminHomePage,
  updatePriceOfAlbums,
};
