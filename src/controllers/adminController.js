const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  const allAlbums = await Album.find({}).sort({ price: 1 }); // Fetch all albums from the database and sort them by price in ascending order
  res.render('adminPage', { albums: allAlbums });
  /*
  #swagger.tags = ['Admin']

  #swagger.summary = 'Admin Home Page'
  #swagger.description = 'Fetch all albums and render the admin home page.'

  #swagger.responses[200] = {
    description: 'Admin home page fetched successfully.',
    schema: { $ref: '#/definitions/Album' }
  }
*/
};

const { updatePriceOfAlbums } = require('../controllers/albumController');

module.exports = {
  adminHomePage,
  updatePriceOfAlbums,
};
