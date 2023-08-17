const Album = require('../models/Album');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const winston = require('winston');

// Configure Winston transports (output destinations)
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(), // Output logs to the console
    new winston.transports.File({ filename: 'app.log' }) // Output logs to a file
    // You can add more transports as needed
  ],
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to log messages
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  )
});

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

  const ids = req.body.map((update) => update.id); //Creates an array of _id values from the albums to be updated in the request body.

  const bulkWriteResponse = await Album.bulkWrite(bulkUpdateOps); //he response object of bulkWrite () contains information about the number of modified documents.
  logger.info(`${bulkWriteResponse.modifiedCount} Albums updated successfully`);
  const updatedAlbums = await Album.find({ _id: { $in: ids } }); // Fetches the updated albums from the database using the _id values in the ids array. //see Implicit $in in mongoose docs
  res.status(StatusCodes.OK).json({ albums: updatedAlbums });
};

//Fetching an album from the database, including all the users that have purchased it
const getAlbumWithAllUsersWhoPurchasedIt = async (req, res) => {
  // Show current user by id with all the albums they've purchased
  let usersThatPurchasedThisAlbum = await Album.findOne({
    _id: req.params.id,
  }).populate({
    path: 'purchasedByUsers', // we want to fill with data this virtual field// name of the virtual to populate
    populate: { path: 'user' }, //with this data// nested populate, without this we would just get back a list of PurchasedAlbum models.
    // But we just want to further populate to get the User model refferred to in  the PurchasedAlbum.user proprty.
  });
  res.status(StatusCodes.OK).json({
    usersThatPurchasedThisAlbum,
    count: usersThatPurchasedThisAlbum.length,
  });
};

const getFilteredAlbums = async (req, res) => {
  const { limit, order, offset, albumName, artistName } = req.query;
  // Create an empty query object to store filtering parameters
  const query = {};
  // Using $regex, we MongoDB search where the provided value is treated as a regular expression.
  if (albumName) {
    query.albumName = { $regex: albumName, $options: 'i' }; //If the albumName parameter is provided.
  }
  if (artistName) {
    query.artistName = { $regex: artistName, $options: 'i' }; // If the artistName. $options: 'i' - case-insensitive
  }
  // Create an empty sortOptions object to store sorting parameters. Methods provided by the Mongoose library
  const sortOptions = {};
  if (order === 'asc') {
    // If the order is 'asc', set sorting to ascending based on creation date
    sortOptions.createdAt = 1;
  } else if (order === 'desc') {
    // If the order is 'desc', set sorting to descending based on creation date
    sortOptions.createdAt = -1;
  }
  // Use the Album model to find albums based on the specified filtering and sorting parameters
  const albums = await Album.find(query)
    .sort(sortOptions)
    .skip(parseInt(offset) || 0) // Skip a specified number of albums (pagination implementation)
    .limit(parseInt(limit) || 10); // Limit the number of returned albums (pagination implementation)

  res.status(StatusCodes.OK).json({ albums, count: albums.length }); // Return the found albums and the count of albums
};

module.exports = {
  updateAlbum,
  createAlbum,
  getAllAlbums,
  getSingleAlbum,
  updatePriceOfAlbums,
  getAlbumWithAllUsersWhoPurchasedIt,
  getFilteredAlbums,
};
