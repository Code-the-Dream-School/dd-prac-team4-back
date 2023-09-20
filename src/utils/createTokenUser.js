/**
 * @typedef {Object} TokenUser - User object with data for token creation.
 * @property {string} name - User's name.
 * @property {string} userId - User's ObjectId from the Mongo database.
 * @property {string} role - User's role. Can be either 'admin' or 'user'.
 * @property {string} email - User's email.
 */
/**
 * Creates a user object based on the data provided by the user.
 *
 * @param {Object} user - User object with data.
 * @param {string} user.name - User's name.
 * @param {string} user._id - User's identifier.
 * @param {string} user.role - User's role.
 * @param {string} user.email - User's email.
 * @returns {TokenUser} - User object with data for token creation.
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
