const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class UnauthorizedError extends CustomAPIError {
  // Define a custom 'UnauthorizedError' class that extends the 'CustomAPIError' class
  constructor(message) {
    // Call the parent class constructor with the provided error message
    super(message);
    // Set the 'statusCode' property of the error to 'FORBIDDEN' from 'StatusCodes'
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;
