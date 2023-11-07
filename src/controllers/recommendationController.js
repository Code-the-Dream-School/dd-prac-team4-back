const AlbumRecommendation = require('../models/AlbumRecommendation');

const getAlbumRecsForUser = async (req, res) => {
  const { userId } = req.params;
  const recommendations = await AlbumRecommendation.find({ userId });
  return res.json({ recommendations });
};

module.exports = {
  getAlbumRecsForUser,
};
