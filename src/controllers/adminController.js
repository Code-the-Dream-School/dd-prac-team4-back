const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  const allAlbums = await Album.find({}).sort({ price: 1 });
  res.render('adminPage', { albums: allAlbums });
};

module.exports = {
  adminHomePage,
};
