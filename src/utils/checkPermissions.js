const CustomError = require('../errors');

const checkPermissions = (requestUser, resourceUserId) => {
    // If the user is an admin, they have permission to access the resource
    if(requestUser.role === 'admin') return;
    // If the user ID from the request matches the resourceUserId, they have permission to access the resource
    if(requestUser.userId === resourceUserId.toString()) return;
    // If none of the above conditions are met, the user is not authorized to access the resource
    throw new CustomError.UnauthorizedError(
        'Not authorized to access this route'
    );
};

module.exports = checkPermissions;