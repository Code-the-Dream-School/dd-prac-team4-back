const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  /*
    #swagger.summary: Update prices of albums
    #swagger.description: Update the prices of selected albums.
    #swagger.responses[200]: { description: 'Successful response with updated albums.' }
    #swagger.responses[400]: { description: 'Bad request, invalid input.' }
    #swagger.responses[500]: { description: 'Internal server error' }
  */
  const allAlbums = await Album.find({}).sort({ price: 1 }); // Fetch all albums from the database and sort them by price in ascending order
  res.render('adminPage', { albums: allAlbums });
};

const { updatePriceOfAlbums } = require('../controllers/albumController');

module.exports = {
  adminHomePage,
  updatePriceOfAlbums,
};
