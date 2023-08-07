const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class UnauthenticatedError extends CustomAPIError { // Define a custom 'UnauthenticatedError' class that extends the 'CustomAPIError' class
  constructor(message) {
    // Call the parent class constructor with the provided error message
    super(message);
    // Set the 'statusCode' property of the error to 'UNAUTHORIZED' from 'StatusCodes'
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthenticatedError;