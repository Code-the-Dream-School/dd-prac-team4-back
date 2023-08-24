const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
  getAllReviewsForThisProduct,
} = require('../controllers/reviewController');

router.route('/').get(getAllReviews);

router
  .route('/album/:albumId')
  .post(authenticateUser, createReview)
  .get(getAllReviewsForThisProduct);

router.route('/:id').patch(authenticateUser, updateReview).get(getSingleReview);

module.exports = router;
