const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => { // Middleware to authenticate the user
    const token = req.signedCookies.token;

    if (!token) { // Check if a token exists
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    } 

    try { // Verify and decode the token
        const { name, userId, role } = isTokenValid({ token });
        req.user = { name, userId, role };  // Attach user information to the request object
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
};

const authorizePermissions = (...roles) => { // Middleware to authorize user permissions
    return(req, res, next) => {
        if (!roles.includes(req.user.role)) { // Check if the user's role is included in the permitted roles
            throw new CustomError.UnauthorizedError(
                'Unautorized to access this route'
            );
        };
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizePermissions,
}