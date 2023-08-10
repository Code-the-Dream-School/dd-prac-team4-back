const { creatJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
// Import utility functions
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');

module.exports = {
  creatJWT, // Export the createJWT function for generating JWT tokens
  isTokenValid, // Export the isTokenValid function for verifying JWT token validity
  attachCookiesToResponse, // Export the attachCookiesToResponse function for attaching JWT tokens as cookies to the response
  createTokenUser, // Export the createTokenUser function for creating a token-based user object
  checkPermissions, // Export the checkPermissions function for checking user permissions
};
