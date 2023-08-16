const Album = require('../models/Album');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const createAlbum = async (req, res) => {
  req.body.user = req.user.userId;
  const album = await Album.create(req.body);
  res.status(StatusCodes.CREATED).json({ album });
};

const getAllAlbums = async (req, res) => {
  const albums = await Album.find({});
  res.status(StatusCodes.OK).json({ albums, count: albums.length });
};

const getSingleAlbum = async (req, res) => {
  const { id: albumId } = req.params;
  const album = await Album.findOne({ _id: albumId });
  if (!album) {
    throw new CustomError.NotFoundError(`No album with id ${albumId}`);
  }
  res.status(StatusCodes.OK).json({ album });
};

const updateAlbum = async (req, res) => {
  const { id: albumId } = req.params;
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
  
const getFilteredAlbums = async (req, res) => {
  const { limit, order, offset, albumName, artistName } = req.query;
// Create an empty query object to store filtering parameters
  const query = {};
  // Using $regex, we MongoDB search where the provided value is treated as a regular expression.
  if (albumName) {
    query.albumName = { $regex: albumName, $options: 'i' }; //If the albumName parameter is provided.
  }
  if (artistName) {
    query.artistName = { $regex: artistName, $options: 'i' };// If the artistName. $options: 'i' - case-insensitive
  }
// Create an empty sortOptions object to store sorting parameters. Methods provided by the Mongoose library
  const sortOptions = {};
  if (order === 'asc') { // If the order is 'asc', set sorting to ascending based on creation date
    sortOptions.createdAt = 1;
  } else if (order === 'desc') { // If the order is 'desc', set sorting to descending based on creation date
    sortOptions.createdAt = -1;
  }
// Use the Album model to find albums based on the specified filtering and sorting parameters
  const albums = await Album.find(query)
    .sort(sortOptions)
    .skip(parseInt(offset) || 0) // Skip a specified number of albums (pagination implementation)
    .limit(parseInt(limit) || 10); // Limit the number of returned albums (pagination implementation)

  res.status(StatusCodes.OK).json({ albums, count: albums.length });// Return the found albums and the count of albums
};

module.exports = {
  updateAlbum,
  createAlbum,
  getAllAlbums,
  getSingleAlbum,
  updatePriceOfAlbums,
  getAlbumsPurchasedByUser,
  getFilteredAlbums,
};