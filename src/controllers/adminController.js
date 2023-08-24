const mongoose = require('mongoose');
const Album = require('../models/Album');

const adminHomePage = async (req, res) => {
  const allAlbums = await Album.find({});
  res.render('adminPage', { albums: allAlbums });
};

module.exports = {
  adminHomePage,
};