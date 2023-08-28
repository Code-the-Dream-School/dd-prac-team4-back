const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const getAllUsers = async (req, res) => {
  /*
     #swagger.summary = 'Fetch all registered users in a database whose role is user (exclude admins)'
     #swagger.responses[200] = {
				description: 'Users successfully fetched.',
        schema: [{ $ref: '#/definitions/PasswordlessUser' }]
		 }
		 
  */

  // Function to get all users
  //console.log(req.user);
  // Find all users with the role 'user' in the database and exclude the 'password' field
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users }); // Send a JSON response with the status code 200 OK and the users
};

const getSingleUser = async (req, res) => {
  /*
     #swagger.summary = 'Fetch a user by id'
     #swagger.parameters['id'] = {
        description: 'Mongo ObjectID of the user to fetch',
     }
     #swagger.responses[200] = {
				description: 'User successfully fetched.',
				schema: { user: { $ref: '#/definitions/PasswordlessUser' } }
		 }
		 #swagger.responses[404] = { description: 'No user with id found.' }
    #swagger.responses[403] = { description: 'Requester forbidden to fetch this user.' }
  */
  // Find the user in the database based on the provided user ID and exclude the 'password' field
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    // Throw a NotFoundError if the user is not found
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermissions(req.user, user._id); // Check if the user has permission to access the user's information
  res.status(StatusCodes.OK).json({ user }); // Send a JSON response with the status code 200 OK and the user
};

const showCurrentUser = async (req, res) => {
  /*
     #swagger.summary = 'Returns information about the requesting user based on cookie session
     #swagger.responses[200] = {
				description: 'User successfully fetched.',
				schema: { $ref: '#/definitions/PasswordlessUser' }
		 }
		 #swagger.responses[404] = { description: 'No user with id found.' }
  */
  const user = await User.findOne({ _id: req.user.userId }).select('-password');

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }

  res.status(StatusCodes.OK).json({ user });
};

// Update the information of the current user
const updateCurrentUser = async (req, res) => {
  /*
     #swagger.summary = 'Fetch a user by id, update their data and return a new user.'
     #swagger.responses[200] = {
				description: 'User successfully fetched and updated.',
				schema: { $ref: '#/definitions/PasswordlessUser' }
		 }
		 #swagger.responses[400] = { description: 'Error. Need to provide both name and email values.' }
  */
  const { email, name } = req.body;
  if (!email || !name) {
    // Check if email and name are provided
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId }).select('-password'); // Find the user in the database based on the current user's ID
  // Update the user's email and name
  user.email = email;
  user.name = name;
  await user.save(); // Save the updated user to the database
  const tokenUser = createTokenUser(user); // Create a token user and attach the user's cookies to the response
  attachCookiesToResponse({ res, user: tokenUser });
  // Send a JSON response with the status code 200 OK and the updated user
  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (req, res) => {
  /*
     #swagger.summary = 'Fetch the current requesting user by id, update their password and save it to the database.'
     #swagger.responses[200] = {
				description: 'User successfully fetched and password updated.',
				schema: { $ref: '#/definitions/PasswordlessUser' }
		 }
		 #swagger.responses[400] = { description: 'Error. Need to provide both new and old password values' }
     #swagger.responses[401] = { description: 'Error. Invalid credentials.' }
  */

  // Function to update the current user's password
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    // Check if oldPassword and newPassword are provided
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId }); // Find the user in the database based on the current user's ID
  // Compare the old password provided with the user's current password
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    // Throw an UnauthenticatedError if the old password is incorrect
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword; // Update the user's password

  await user.save(); // Save the updated user to the database
  // Send a JSON response with the status code 200 OK and a success message
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const deleteSingleUser = async (req, res) => {
  /*
     #swagger.summary = 'Fetch a user by id and delete user.'
     #swagger.responses[200] = {
				description: 'User successfully fetched and deleted.'
				
		 }
		  #swagger.responses[404] = { description: 'No user with id found.' }
  */
  const userId = req.params.id;
  if (!userId) {
    // Throw a NotFoundError if the user is not found
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  // Find the user by ID and delete
  await User.findByIdAndDelete(userId);
  res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
};

//Fetching a user from the database, including all the albums they've purchased
const getCurrentUserWithPurchasedAlbums = async (req, res) => {
  /*
     #swagger.summary = 'Fetch a user by id and all albums they purchased.'
     #swagger.parameters['id'] = {
        description: 'Mongo ObjectID of the user to fetch',
     }
     #swagger.responses[200] = {
				description: 'User and their albums purchased fetched successfully.'
				
		 }
		  #swagger.responses[404] = { description: 'No user with id found.' }
  */
  // Show current user by id with all the albums they've purchased + see createTokenUser- userId comes from there
  let userWithAlbums = await User.findById(req.user.userId)
    .select('-password')
    .populate({
      path: 'purchasedAlbums', // we fill in virtual field purchasedAlbums // name of the virtual to populate
      populate: { path: 'album' }, //  with this info // nested populate, without this we would just get back a list of PurchasedAlbum models.
      // But we just want to further populate to get the Album model refferred to in  the PurchasedAlbum.album proprty.
    });
  if (!userWithAlbums) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({
    user: userWithAlbums,
    purchasedAlbumCount: userWithAlbums.purchasedAlbums.length,
  });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateCurrentUser,
  updateUserPassword,
  deleteSingleUser,
  getCurrentUserWithPurchasedAlbums,
};
