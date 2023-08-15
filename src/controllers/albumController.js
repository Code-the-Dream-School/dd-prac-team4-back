const Album = require('../models/Album');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createAlbum = async (req, res) => {
  req.body.user = req.user.userId; // req.body.user - user is required to be provided (see Album.js line 55) and is set to req.user.userId
  const album = await Album.create(req.body); //in req.body come all the data from the frontend
  res.status(StatusCodes.CREATED).json({ album });
  //we want to attach user from AlbumSchema to identify WHO is trying to create a products , and if it´s an admin- allow him to do it
};

const getAllAlbums = async (req, res) => {
  const albums = await Album.find({});
  res.status(StatusCodes.OK).json({ albums, count: albums.length });
};

const getSingleAlbum = async (req, res) => {
  //id of the album is located in req.params
  const { id: albumId } = req.params; //This extracts the id parameter from the request's URL parameters and assigns it to the productId variable.
  const album = await Album.findOne({ _id: albumId }); // find an album in the database with the specified _id that matches albumId or id from req.params
  if (!album) {
    throw new CustomError.NotFoundError(`No album with id ${albumId}`);
  }
  res.status(StatusCodes.OK).json({ album });
};

const updateAlbum = async (req, res) => {
  const { id: albumId } = req.params; //take id from req.params is assign to albumId
  const album = await Album.findOneAndUpdate({ _id: albumId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!album) {
    throw new CustomError.NotFoundError(`No album with id ${albumId}`);
  }
  res.status(StatusCodes.OK).json({ album });
};

//will be user to let admin update price of several albums on the frontend

const updatePriceOfAlbums = async (req, res) => {
  const bulkUpdateOps = req.body.map((update) => ({
    updateOne: {
      filter: { _id: update.id },
      update: { price: update.price },
    },
  }));

  try {
    await Album.bulkWrite(bulkUpdateOps);
    logger.info('Albums updated successfully');
  } catch (err) {
    logger.error(err);
  }
  res.status(StatusCodes.OK).json({ albums: bulkUpdateOps });
};

const getAlbumsPurchasedByUser = async (req, res) => {
  // Show album by id with all the users that purchased it
  let albumsOfUser = await Album.findOne({ _id: req.params.id }).populate({
    path: 'purchasedByUsers',
    populate: { path: 'user' },
  });
  res.status(StatusCodes.OK).json({ albumsOfUser, count: albumsOfUser.length });
};

module.exports = {
  updateAlbum,
  createAlbum,
  getAllAlbums,
  getSingleAlbum,
  updatePriceOfAlbums,
  getAlbumsPurchasedByUser,
};
