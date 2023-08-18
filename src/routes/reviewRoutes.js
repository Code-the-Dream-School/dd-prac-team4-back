const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const { createReview } = require('../controllers/reviewController');

router.route('/').post(authenticateUser, createReview);

module.exports = router;
