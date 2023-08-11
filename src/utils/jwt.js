const jwt = require('jsonwebtoken');

const creatJWT = ({ payload }) => {
  // Create a JWT token with the provided payload
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME, // Set the expiration time for the token
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET); // Verify the validity of a JWT token

const attachCookiesToResponse = ({ res, user }) => {
  // Attach a JWT token as a cookie to the response object
  const token = creatJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24; // Calculate the duration of one day in milliseconds

  res.cookie('token', token, {
    httpOnly: true, // Set the cookie as HTTP-only to prevent client-side JavaScript access
    expires: new Date(Date.now() + oneDay), // Set the cookie expiration time
    secure: process.env.NODE_ENV === 'production', // Set the secure flag to only send the cookie over HTTPS in production
    signed: true, // Sign the cookie value
  });
};

module.exports = {
  creatJWT,
  isTokenValid,
  attachCookiesToResponse,
};
