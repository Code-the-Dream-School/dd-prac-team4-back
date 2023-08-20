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

//? for Akos- does it matter which type of request we add here- put or patch? because I used put but it didn't overwright the id of the review
router.route('/:id').patch(authenticateUser, updateReview).get(getSingleReview)
module.exports = router;
