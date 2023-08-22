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


router.route('/album/:albumId').post(authenticateUser, createReview);

router.route('/:id').patch(authenticateUser, updateReview).get(getSingleReview)

router.route('/album/:albumId').get(getAllReviewsForThisProduct)

module.exports = router;
