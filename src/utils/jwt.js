const jwt = require('jsonwebtoken');

/**
 * Creates a JWT token with the provided data.
 *
 * @param {Object} options - Options for creating a JWT token.
 * @param {Object} options.payload - The payload data for the token.
 * @returns {string} - JWT token.
 */

const creatJWT = ({ payload }) => {
  // Create a JWT token with the provided payload
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME, // Set the expiration time for the token
  });
  return token;
};

/**
 * Checks the validity of a JWT token.
 *
 * @param {Object} options - Options for verifying a JWT token.
 * @param {string} options.token - The JWT token to verify.
 * @throws {Error} - Thrown if the token is invalid.
 */

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET); // Verify the validity of a JWT token

/**
 * Attaches cookies with a JWT token to the response object.
 *
 * @param {Object} options - Options for attaching cookies to the response.
 * @param {Object} options.res - The response object.
 * @param {Object} options.user - User data for creating a JWT token.
 */

const attachCookiesToResponse = ({ res, user }) => {
  // Attach a JWT token as a cookie to the response object
  const token = creatJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24; // Calculate the duration of one day in milliseconds

  res.cookie('token', token, {
    httpOnly: true, // Set the cookie as HTTP-only to prevent client-side JavaScript access
    expires: new Date(Date.now() + oneDay), // Set the cookie expiration time
    secure: process.env.NODE_ENV === 'production', // Set the secure flag to only send the cookie over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Lax', // Set the sameSite property 'none' to allow requests from cross-site domain (frontend). Together with "secure: true" we still will prevent CSRF attacks against the application
    signed: true, // Sign the cookie value
  });
};

module.exports = {
  creatJWT,
  isTokenValid,
  attachCookiesToResponse,
};
