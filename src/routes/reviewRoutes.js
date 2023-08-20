const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
} = require('../controllers/reviewController');

router.route('/').post(authenticateUser, createReview).get(getAllReviews);

router.route('/:id').patch(authenticateUser, updateReview).get(getSingleReview)
module.exports = router;
