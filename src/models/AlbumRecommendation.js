const mongoose = require('mongoose');

const albumRecommendationSchema = new mongoose.Schema({
  userId: String,
  songId: String,
});

const AlbumRecommendation = mongoose.model(
  'AlbumRecommendation',
  albumRecommendationSchema
);

module.exports = AlbumRecommendation;
