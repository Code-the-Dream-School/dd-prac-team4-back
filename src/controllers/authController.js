const User = require('../models/User');
const argon2 = require('argon2');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
const crypto = require('crypto');
const emailSender = require('../email/sender');

const register = async (req, res) => {
  const { name, email, password, username } = req.body;

  if (!email || !name || !password || !username) {
    throw new CustomError.BadRequestError('Please provide all required fields');
  }

  const emailAlreadyExists = await User.findOne({ email }); // Check if a user with the email already exists
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists'); // If user exists, throw an error
  }

  const isFirstAccount = (await User.countDocuments({})) === 0; // Check if it's the first account
  const role = isFirstAccount ? 'admin' : 'user'; // Assign a role based on first account or not

  const user = await User.create({
    name,
    username,
    email,
    password,
    role,
  }); // Create a new user in the database
  const tokenUser = createTokenUser(user); // Create a token based on user data
  attachCookiesToResponse({ res, user: tokenUser }); // Attach the token to cookies and send in the response

  res.status(StatusCodes.CREATED).json({ user: tokenUser }); // Send a successful response with user data
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password'); // If either field is not provided, throw an error
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

//logout endpoint

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

//forgotPassword endpoint
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError('Please provide an email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError('User not found');
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now

  // Update user's reset token and expiration date
  user.passwordResetToken = resetToken;
  user.passwordResetExpiresOn = new Date(resetExpires);
  await user.save();

  // Send reset password email
  const emailTemplate = 'forgotPassword'; // to adjust this based on our email template name
  const recipient = user.email;
  const localVariables = {
    resetToken,
  };
  await emailSender.send(emailTemplate, recipient, localVariables);

  res.status(StatusCodes.OK).json({ message: 'Password reset email sent' });
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
};
