const AlbumRecommendation = require('../models/AlbumRecommendation');
const recommendationController = require('../controllers/recommendationController');
async function generateAlbumRecommendations(userId) {
  return await AlbumRecommendation.find({ userId });
}
const getAlbumRecsForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const recommendations =
      await recommendationController.generateAlbumRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error while generating recommendations:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while generating recommendations.' });
  }
};

module.exports = {
  generateAlbumRecommendations,
  getAlbumRecsForUser,
};
