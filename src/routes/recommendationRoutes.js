// recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

router.get('/:userId', async (req, res) => {
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
});

module.exports = router;
