const createTokenUser = (user) => {
  // Create a token-based user object using the provided user data
  return {
    name: user.name,
    userId: user._id,
    role: user.role,
    email: user.email,
    username: user.username,
  };
};

module.exports = createTokenUser;
