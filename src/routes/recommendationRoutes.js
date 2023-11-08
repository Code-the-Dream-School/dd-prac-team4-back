// recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

router.get('/:userId', recommendationController.getAlbumRecsForUser);

module.exports = router;
