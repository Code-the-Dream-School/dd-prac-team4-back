const CustomError = require('../errors');
const { isTokenValid } = require('../utils/jwt');

const authenticateUser = async (req, res, next) => { // Middleware function to authenticate the user
  let token;
  // check header
  const authHeader = req.headers.authorization; // Check if the token is present in the request header
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  // check cookies
  else if (req.cookies.token) { // If not present in the header, check if the token is present in cookies
    token = req.cookies.token;
  }

  if (!token) { // If no token is found, throw an UnauthenticatedError
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
  try {
    const payload = isTokenValid(token); // Verify the validity of the token and extract the payload

    // Attach the user and his permissions to the req object
    req.user = {
      userId: payload.user.userId,
      role: payload.user.role,
    };

    next(); // Call the next middleware in the chain
  } catch (error) {
    // If an error occurs during token verification, throw an UnauthenticatedError
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

const authorizeRoles = (...roles) => { // Middleware function to authorize user roles
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) { // Check if the user's role is included in the authorized roles
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next(); // Call the next middleware in the chain
  };
};

module.exports = { authenticateUser, authorizeRoles };