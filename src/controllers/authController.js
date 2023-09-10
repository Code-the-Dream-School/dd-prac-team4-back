const User = require('../models/User');
const argon2 = require('argon2');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
const crypto = require('crypto');
const emailSender = require('../mailing/sender');

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
  /* 
    #swagger.summary = 'Register a new user'
    #swagger.parameters['user'] = {
      in: 'body',
      description: 'User registration information',
      required: true,
      schema: {
        $name: "John Doe",
        $email: "jdoe@example.com",
        $password: "supersecretpassword",
        $username: "jdoe99"
      }
    }
    #swagger.responses[201] = {
      description: 'User registered successfully',
      schema: {
        $ref: '#/definitions/TokenizedUser'
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request, missing email, name, password, or username'
    }
  */
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
  /* 
    #swagger.summary = 'Login as a user'
    #swagger.parameters['user'] = {
      in: 'body',
      description: 'User email and password for login',
      required: true,
      schema: {
        $email: "jdoe@example.com",
        $password: "supersecretpassword",
      }
    }
    #swagger.responses[201] = {
      description: 'User logged in successfully',
      schema: {
        $ref: '#/definitions/TokenizedUser' 
      }
    }
    #swagger.responses[400] = {
      description: 'Bad request, missing email or password'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized, invalid credentials'
    }
  */
};

//logout endpoint
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  /*
    #swagger.summary = 'Logout a user'
    #swagger.description = 'This endpoint checks for a signed JWT token in an HTTP-only cookie and clears it. It checks the `token` field in the cookie.'
    #swagger.responses[200] = {
        description: 'User logged out successfully',
        schema: { msg: 'user logged out!' }
    }
    #swagger.security = [{ "JWT": [] }]
  */
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
  await emailSender.sendForgotPasswordEmail(
    emailTemplate,
    recipient,
    localVariables
  );

  res.status(StatusCodes.OK).json({ message: 'Password reset email sent' });
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
};
