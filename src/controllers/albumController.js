const Album = require('../models/Album');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const logger = require('../../logs/logger');

const createAlbum = async (req, res) => {
  req.body.user = req.user.userId;
  const album = await Album.create(req.body);
  res.status(StatusCodes.CREATED).json({ album });
  /*
     #swagger.summary = 'Create new album and save it to the database'
            #swagger.autoBody = false
            #swagger.parameters['newAlbum'] = {
        in: 'body',
        description: 'Album information to use for creation.',
        required: true,
        type: 'object',
        schema: { $ref: '#/definitions/NewAlbum' }
     } 
     #swagger.description = '**ROLE REQUIRED:** admin'
     #swagger.responses[201] = {
				description: 'Albums was successfully created.',
        schema: { album: { $ref: '#/definitions/Album' } }
		 }
     #swagger.responses[400] = { description: 'validation error' }
		 
  */
};

const getAllAlbums = async (req, res) => {
  const albums = await Album.find({ price: { $gt: 0 } }); // Fetch albums with price greater than 0
  res.status(StatusCodes.OK).json({ albums, count: albums.length });
  /*
     #swagger.summary = 'Fetch all albums in a database (with price > $0)'

     #swagger.responses[200] = {
				description: 'Albums  successfully fetched.',
         schema: { albums: [{ $ref: '#/definitions/Album' }], count: 1 }
		 }
		 
  */
};

const getSingleAlbum = async (req, res) => {
  const { id: albumId } = req.params;
  const album = await Album.findOne({ _id: albumId });
  if (!album) {
    throw new CustomError.NotFoundError(`No album with id ${albumId}`);
  }
  res.status(StatusCodes.OK).json({ album });
  /*
     #swagger.summary = 'Fetch an album  by id'
     #swagger.parameters['id'] = {
        description: 'Mongo ObjectID of the album to fetch',
     }
     #swagger.responses[200] = {
				description: 'Album successfully fetched.',
				schema: { album: { $ref: '#/definitions/Album' } }
		 }
		 #swagger.responses[404] = { description: 'No album with this id was found.' }

  */
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
  /*
     #swagger.summary = 'Fetch an album  by id and update it'
     #swagger.parameters['id'] = {
        description: 'Mongo ObjectID of the album to fetch',
     }
          #swagger.parameters['album properties to update'] = {
      in: 'body',
      description: 'Album information to use for update',
      required: true,
      type: 'object',
      schema: { $ref: '#/definitions/NewAlbum' }
     }
     #swagger.responses[200] = {
				description: 'Album successfully fetched and updated.',
				schema: { album: { $ref: '#/definitions/Album' } }
		 }
     #swagger.responses[400] = { description: 'validation error' }
		 #swagger.responses[404] = { description: 'No album with this id was found.' }

  */
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
  /*
     #swagger.summary = 'Update prices of albums passed in req.body'
	#swagger.autoBody = false
	#swagger.parameters['albums to update prices'] = {
		in: 'body',
		description: 'Array of information to use to update album prices',
		required: true,
		type: 'array',
		schema: [{ id: "5f9d7b3b9d9d9d9d9d9d9d9d", price: 9.99 }]
 }
     #swagger.responses[200] = {
				description: 'Albums prices  were successfully updated.',
				schema: { albums: [{ $ref: '#/definitions/Album' }] }
		 }
  */
};

//Fetching an album from the database, including all the users that have purchased it
const getAlbumWithAllUsersWhoPurchasedIt = async (req, res) => {
  // Show current user by id with all the albums they've purchased
  let usersThatPurchasedThisAlbum = await Album.findOne({
    _id: req.params.id,
  }).populate({
    path: 'purchasedByUsers', // we want to fill with data this virtual field// name of the virtual to populate
    populate: { path: 'user', options: { select: { password: 0 } } }, //with this data// nested populate, without this we would just get back a list of PurchasedAlbum models.
    // But we just want to further populate to get the User model refferred to in  the PurchasedAlbum.user proprty.
    // Also we pass in a `select` so that we don't return the hashed user passwords
  });
  if (!usersThatPurchasedThisAlbum) {
    throw new CustomError.NotFoundError(
      `No album with id ${req.params.id} was found`
    );
  }
  res.status(StatusCodes.OK).json({
    album: usersThatPurchasedThisAlbum,
    purchasingUsersCount: usersThatPurchasedThisAlbum.purchasedByUsers.length,
  });
  /*
     #swagger.summary = 'Show all users that purchased this particular album'

     #swagger.responses[200] = {
				description: 'Album with users who purchased it was fetched  successfully ',
				schema: { album: { $ref: '#/definitions/AlbumWithUsers' }, purchasingUsersCount: 1 }
		 }
     #swagger.responses[404] = { description: 'No album with this id wasfound.' }

  */
};

const getFilteredAlbums = async (req, res) => {
  const { limit, order, offset, albumName, artistName } = req.query;

  console.log('reqoriginalUrl is', req.originalUrl);

  const url = new URL('http://localhost:8000' + req.originalUrl); // create a "URL" object
  //Akos: req.originalUrl solo gives an error

  const parsedOffset = parseInt(offset, 10) || 0;
  const parsedLimit = parseInt(limit, 10) || 10;

  // Create an empty query object to store filtering parameters
  const query = { price: { $gt: 0 } }; // Add the price condition to the query};
  // Using $regex, we MongoDB search where the provided value is treated as a regular expression.
  if (albumName) {
    query.albumName = { $regex: albumName, $options: 'i' }; //If the albumName parameter is provided.
  }
  if (artistName) {
    query.artistName = { $regex: artistName, $options: 'i' }; // If the artistName. $options: 'i' - case-insensitive
  }
  // Count the total number of matching albums (excluding limit and offset for accurate count)
  const totalCount = await Album.countDocuments(query);

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
    .skip(parsedOffset || 0) // Skip a specified number of albums (pagination implementation)
    .limit(parsedLimit || 10); // Limit the number of returned albums (pagination implementation)

  const totalPages = Math.ceil(totalCount / (parsedLimit || 10));
  const currentPage = Math.ceil(
    ((parsedOffset || 0) + 1) / (parsedLimit || 10)
  );
  const more = currentPage < totalPages;

  const nextPageUrl = new URL(url.toString());
  nextPageUrl.searchParams.set(
    'offset',
    (parsedOffset || 0) + (parsedLimit || 10)
  );

  const prevPageUrl = new URL(url.toString());
  if (currentPage > 1) {
    prevPageUrl.searchParams.set(
      'offset',
      (parsedOffset || 0) - (parsedLimit || 10)
    );
  }

    res.status(StatusCodes.OK).json({
    albums,
    count: albums.length,
    total: totalCount,
    more,
    currentPage,
    totalPages,
    nextPage: more ? nextPageUrl.toString() : null,
    prevPage: currentPage > 1 ? prevPageUrl.toString() : null,
  });
  console.log('nextPageUrl:', nextPageUrl.toString()); 
  console.log('prevPageUrl:', prevPageUrl.toString());

  /*
     #swagger.summary = 'Fetch paginated list of albums with price > 0, with query parameters for sorting and filtering'
     #swagger.autoQuery = false
     #swagger.parameters['limit'] = {
        description: 'Number of albums to fetch',
        default: 10,
        in: 'query'
     }
     #swagger.parameters['offset'] = {
        description: 'Number of albums to skip (use with limit to page through results)',
        default: 0,
        in: 'query'
     }

     #swagger.parameters['order'] = {
        description: 'Order of results',
        in: 'query',
        schema: {
          '@enum': ['asc', 'desc']
        }
     }

     #swagger.parameters['albumName'] = {
        description: 'String to filter results by matching any part of album name (case-insensitive)',
        in: 'query'
     }

     #swagger.parameters['artistName'] = {
        description: 'String to filter results by matching any part of artist name (case-insensitive)',
        in: 'query'
     }
     #swagger.responses[200] = {
				description: 'Filtered by query parameters and with price more than 0 albums were successfully fetched.',
         schema: { albums: [{ $ref: '#/definitions/Album' }], count: 1 }
		 }
		 
  */
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
