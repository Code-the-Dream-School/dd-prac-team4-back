const AlbumRecommendation = require('../models/AlbumRecommendation');
const recommendationController = require('../controllers/recommendationController');
async function generateAlbumRecommendations(userId) {
  return await AlbumRecommendation.find({ userId });
}
const getAlbumRecsForUser = async (req, res) => {
  const { userId } = req.params;
  const recommendations =
    await recommendationController.generateAlbumRecommendations(userId);
  return res.json({ recommendations: recommendations });
};

module.exports = {
  generateAlbumRecommendations,
  getAlbumRecsForUser,
};
