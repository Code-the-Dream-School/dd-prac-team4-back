const User = require('../models/User');
const argon2 = require('argon2');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
  const { email, name, password } = req.body; // Extract data from the request

  const emailAlreadyExists = await User.findOne({ email }); // Check if a user with the email already exists
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists'); // If user exists, throw an error
  }

  const isFirstAccount = (await User.countDocuments({})) === 0; // Check if it's the first account
  const role = isFirstAccount ? 'admin' : 'user'; // Assign a role based on first account or not

  const hashedPassword = await argon2.hash(password); // Hash the password

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  }); // Create a new user in the database
  const tokenUser = createTokenUser(user); // Create a token based on user data
  attachCookiesToResponse({ res, user: tokenUser }); // Attach the token to cookies and send in the response

  res.status(StatusCodes.CREATED).json({ user: tokenUser }); // Send a successful response with user data
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password'); // If both fields are not provided, throw an error
  }
  const user = await User.findOne({ email }); // Find a user by email

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordValid = await argon2.verify(user.password, password); // Check password validity
  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials'); // If password is incorrect, throw an error
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

module.exports = {
  register,
  login,
};