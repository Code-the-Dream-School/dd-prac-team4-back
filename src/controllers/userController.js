const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils');

const getSingleUser = async(req,res) => { // Function to get a single user by ID
    // Find the user in the database based on the provided user ID and exclude the 'password' field
    const user = await User.findOne({ _id: req.params.id }).select('-password');
    if(!user) { // Throw a NotFoundError if the user is not found
        throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
    }
    checkPermissions(req.user, user._id); // Check if the user has permission to access the user's information
    res.status(StatusCodes.OK).json({ user }); // Send a JSON response with the status code 200 OK and the user
};

// update user with user.save()
const updateUser = async(req,res) => {
    const { email, name } = req.body;
    if (!email || !name) { // Check if email and name are provided
        throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ _id: req.user.userId }); // Find the user in the database based on the current user's ID
     // Update the user's email and name
    user.email = email;
    user.name = name;
    await user.save();  // Save the updated user to the database
    const tokenUser = createTokenUser(user); // Create a token user and attach the user's cookies to the response
    attachCookiesToResponse({ res, user:tokenUser });
    // Send a JSON response with the status code 200 OK and the updated user
    res.status(StatusCodes.OK).json({ user: tokenUser });
};

module.exports = {
    getSingleUser,
    updateUser,
};
