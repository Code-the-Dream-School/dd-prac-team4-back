const express = require('express');
const router = express.Router();
const recentlyListenedController = require('../controllers/recentlyListenedController');

router.get(
  '/:userId',
  recentlyListenedController.getRecentlyListenedAlbumsForUser
);

module.exports = router;
