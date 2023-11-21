const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { firebaseApp } = require('../firebase');

const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require('firebase/storage');

const getAllUsers = async (req, res) => {
  // Function to get all users
  //console.log(req.user);
  // Find all users with the role 'user' in the database and exclude the 'password' field
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users }); // Send a JSON response with the status code 200 OK and the users
  /*
     #swagger.summary = 'Fetch all registered users in a database whose role is user (exclude admins)'
     #swagger.description = '**ROLE REQUIRED:** admin'
     #swagger.responses[200] = {
				description: 'Users successfully fetched.',
        schema: { users: [{ $ref: '#/definitions/PasswordlessUser' }] }
		 }
		 
  */
};

const getSingleUser = async (req, res) => {
  // Find the user in the database based on the provided user ID and exclude the 'password' field
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    // Throw a NotFoundError if the user is not found
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermissions(req.user, user._id); // Check if the user has permission to access the user's information
  res.status(StatusCodes.OK).json({ user }); // Send a JSON response with the status code 200 OK and the user
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
};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select('-password');

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }

  res.status(StatusCodes.OK).json({ user });
  /*
     #swagger.summary = 'Returns information about the requesting user based on cookie session'
     #swagger.responses[200] = {
				description: 'User successfully fetched.',
				schema: { user: { $ref: '#/definitions/PasswordlessUser' } }
		 }
		 #swagger.responses[404] = { description: 'No user with id found.' }
  */
};

// Update the information of the current user
const updateCurrentUser = async (req, res) => {
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
  /*
     #swagger.summary = 'Fetch the requesting user, update their data and return the updated user.'
     #swagger.responses[200] = {
				description: 'User successfully fetched and updated.',
				schema: { user: { $ref: '#/definitions/PasswordlessUser' } }
		 }
		 #swagger.responses[400] = { description: 'Error. Need to provide both name and email values.' }
  */
};

const updateUserPassword = async (req, res) => {
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

  /*
     #swagger.summary = 'Fetch the current requesting user by id, update their password and save it to the database.'
     #swagger.responses[200] = {
				description: 'User successfully fetched and password updated.',
				schema: { msg: 'Success! Password Updated.' }
		 }
		 #swagger.responses[400] = { description: 'Error. Need to provide both new and old password values' }
     #swagger.responses[401] = { description: 'Error. Invalid credentials.' }
  */
};
const deleteSingleUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    // Throw a NotFoundError if the user is not found
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  // Find the user by ID and delete
  await User.findByIdAndDelete(userId);
  res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  /*
     #swagger.summary = 'Fetch a user by id and delete user.'
     #swagger.description = '**ROLE REQUIRED:** admin'
     #swagger.responses[200] = {
				description: 'User successfully fetched and deleted.'
				
		 }
		  #swagger.responses[404] = { description: 'No user with id found.' }
  */
};

//Fetching a user from the database, including all the albums they've purchased
const getCurrentUserWithPurchasedAlbums = async (req, res) => {
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
  /*
     #swagger.summary = 'Fetch a user by id and all albums they purchased.'
     #swagger.responses[200] = {
				description: 'User and their albums purchased fetched successfully.',
				schema: { user: { $ref: '#/definitions/UserWithAlbums' }, purchasedAlbumCount: 1}
		 }
		  #swagger.responses[404] = { description: 'No user with id found.' }
  */
};

const updateProfileImage = async (req, res) => {
  console.log('Updating profile image.');
  const firebaseStorage = getStorage(firebaseApp);
  const userId = req.user.userId;
  if (!req.files || Object.keys(req.files).length === 0) {
    throw new CustomError.BadRequestError('No files were uploaded.');
  }
  const profile = req.files.profile;
  if (!profile || !profile.data || !profile.mimetype) {
    throw new CustomError.BadRequestError('File is not an image.');
  }
  const imageRef = ref(firebaseStorage, `images/${userId}_profile_pic`);
  await uploadBytes(imageRef, profile.data, {
    contentType: profile.mimetype,
  });
  const imageUrl = await getDownloadURL(imageRef);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profileImage: { url: imageUrl, altText: 'user profile picture' } },
    { new: true }
  );
  console.log('Profile image updated successfully!');
  res.status(StatusCodes.OK).json({ imageUrl });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateCurrentUser,
  updateUserPassword,
  deleteSingleUser,
  getCurrentUserWithPurchasedAlbums,
  updateProfileImage,
};
