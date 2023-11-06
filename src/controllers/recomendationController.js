const AlbumRecommendation = require('../models/AlbumRecommendation');

async function generateAlbumRecommendations(userId) {
  return await AlbumRecommendation.find({ userId });
}

module.exports = {
  generateAlbumRecommendations,
};
