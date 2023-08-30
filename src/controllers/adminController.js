const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  const allAlbums = await Album.find({}).sort({ price: 1 }); // Fetch all albums from the database and sort them by price in ascending order
  res.render('adminPage', { albums: allAlbums });
};

const { updatePriceOfAlbums } = require('../controllers/albumController');

module.exports = {
  adminHomePage,
  updatePriceOfAlbums,
};
