/**
 * Creates a user object based on the data provided by the user.
 *
 * @param {Object} user - User object with data.
 * @param {string} user.name - User's name.
 * @param {string} user._id - User's identifier.
 * @param {string} user.role - User's role.
 * @param {string} user.email - User's email.
 * @returns {Object} - User object with data for token creation.
 */

const createTokenUser = (user) => {
  // Create a token-based user object using the provided user data
  return {
    name: user.name,
    userId: user._id,
    role: user.role,
    email: user.email,
  };
};

module.exports = createTokenUser;
