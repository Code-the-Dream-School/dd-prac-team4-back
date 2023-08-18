const Review = require('../models/Review');
const Album = require('../models/Album');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

//create review
const createReview = async (req, res) => {
  //( frontend sends an album property in the req.body) ! we MUST PROVIDE which album we are requesting- "album": "64d2a94c793389a43fc5a8ec",
  const { album: albumId } = req.body; //check /look for the album in req.body and assign it to albumId // in postman in REQUEST { album: albumId } : {"album": "647e247e69c32ece45e23978"}
  //check if album exists in db
  const isValidAlbum = await Album.findOne({ _id: albumId });
  if (!isValidAlbum) {
    throw new CustomError.NotFoundError(`No album with id : ${albumId}`);
  }
  //check if there is already review for this album from this user
  const alreadySubmitted = await Review.findOne({
    album: albumId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Already submitted review for this album'
    );
  }
  //The user property is added to the request body with the userId of the authenticated user. This ensures that the created review is associated with the correct user.
  req.body.user = req.user.userId; // req.user.userId came from req.user = { name, userId, role }; //from the object we pass with each request to the browser with name, userId role, - check authentication.js line 16 // so we are able to see in postman which user makes this post request- "user": "123"
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

module.exports = {
  createReview,
};
