const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  createReview,
  updateReview,
} = require('../controllers/reviewController');

router.route('/album/:albumId').post(authenticateUser, createReview);

//? for Akos- does it matter which type of request we add here- put or patch? because I used put but it didn't overwright the id of the review
router.route('/:id').put(authenticateUser, updateReview);

module.exports = router;
