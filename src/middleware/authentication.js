

//check for the user in general- if he exists in db
const authenticateUser = async (req, res, next) => {
  //since we signed cookie with JWT secret it is stored in req.signedCookies and .token is the name we gave to our cookie in jwt.js on line 22. if cookies are not signed- they are in req.cookies
  const token = req.signedCookies.token;
  //if we 've logged out  or user isn't registered/logged in, the error will be thrown
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
  try {
    const { name, userId, role } = isTokenValid({ token }); // we destructure token- and take name, userId, role to attach it to req.user- we can log it in userController.js
    req.user = { name, userId, role }; //we add  name, userId and role to the req object under the "user" field/property, to be used in any following middleware or controllers
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

module.exports = {
  authenticateUser,
};