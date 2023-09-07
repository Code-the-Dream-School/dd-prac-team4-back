const Review = require('../models/Review');
const Album = require('../models/Album');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

//create review
const createReview = async (req, res) => {
  //( frontend sends an album property in the req.body) ! we MUST PROVIDE which album we are requesting- "album": "64d2a94c793389a43fc5a8ec",
  const { albumId } = req.params; //check /look for the albumId in req.params

  //add it to req.body before creating the review
  req.body.album = albumId;

  //check if album exists in db
  const isValidAlbum = await Album.exists({ _id: albumId });
  if (!isValidAlbum) {
    throw new CustomError.NotFoundError(`No album with id : ${albumId}`);
  }
  //check if there is already review for this album from this user
  const alreadySubmitted = await Review.findOne({
    album: albumId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.Conflict(
      'You already submitted review for this album'
    );
  }
  //The user property is added to the request body with the userId of the authenticated user. This ensures that the created review is associated with the correct user.
  req.body.user = req.user.userId; // req.user.userId came from req.user = { name, userId, role }; //from the object we pass with each request to the browser with name, userId role, - check authentication.js line 16 // so we are able to see in postman which user makes this post request- "user": "123"
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

//update review
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params; //take id of the review from req.params and assign it to reviewId

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  // Check if the requesting user is the author of the review
  //option 1 -only checks if the user is the author of the review
  if (review.user.toString() !== req.user.userId) {
    throw new CustomError.UnauthorizedError(
      'You are not authorized to update this review'
    );
  }
  //option 2 -checks if it's an admin or user who wrote the review
  // checkPermissions(req.user, review.user);

  // Validate if required fields are present in the request body
  //option A:
  if (!req.body.rating || !req.body.title || !req.body.comment) {
    throw new CustomError.BadRequestError(
      'Rating, title, and comment are required fields'
    );
  }
  // Update review properties
  review.rating = req.body.rating;
  review.title = req.body.title;
  review.comment = req.body.comment;

  //option B:
  //   review.rating = req.body.hasOwnProperty('rating')
  //     ? req.body.rating
  //     : review.rating;
  //   review.title = req.body.hasOwnProperty('title')
  //     ? req.body.title
  //     : review.title;
  //   review.comment = req.body.hasOwnProperty('comment')
  //     ? req.body.comment
  //     : review.comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

// get All Reviews
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    //adding more info to the review using populate method- aka fill , add the info from mongoose model
    //review+ about which album
    path: 'album', //we pass what we want to reference //line 26 in Review.js
    select: 'artistName albumName image price', //and what properties we want to get from Album model (Album.js)

    //and to populate user data: review+user who wrote it
    // path: 'user', //we pass what we want to reference //in Review.js
    // select: 'email name username', //and what properties we want to get from album model
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

//get All reviews for a particular product/album
const getAllReviewsForThisProduct = async (req, res) => {
  const { albumId } = req.params; //check /look for the albumId in req.params
  const allProductReviews = await Review.find({ album: albumId });
  res
    .status(StatusCodes.OK)
    .json({ allProductReviews, count: allProductReviews.length });
};

//get single review
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params; //using object destructuring to extract the id property from the params object of the req (request) object and assign it to the reviewId variable.
  const review = await Review.findOne({ _id: reviewId }); //look for specific review match between id in url and _id in db

  //in case we want to add extra info to the single review //here: about which album is this review
  //   .populate({
  //     path: 'album',
  //     select: 'artistName albumName image price',
  //   });

  //check if there is no review- throw an error
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

// delete review
const deleteReview = async (req, res) => {
  const { id } = req.params; // take the id of the review from req.params

  // Fetch the existing review
  const review = await Review.findOne({ _id: id });

  // Check if the review exists
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${id}`);
  }

  // Check if the requesting user is the author of the review
  if (review.user.toString() !== req.user.userId) {
    throw new CustomError.ForbiddenError(
      'You are not authorized to delete this review'
    );
  }

  // Delete the review
  await Review.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({ message: 'Review deleted successfully' });
};
module.exports = {
  createReview,
  updateReview,
  getAllReviews,
  getAllReviewsForThisProduct,
  getSingleReview,
  deleteReview,
};
