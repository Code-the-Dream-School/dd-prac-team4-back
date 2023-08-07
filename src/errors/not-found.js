const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class NotFoundError extends CustomAPIError { // Define a custom 'NotFoundError' class that extends the 'CustomAPIError' class
  constructor(message) {
    // Call the parent class constructor with the provided error message
    super(message);
    // Set the 'statusCode' property of the error to 'NOT_FOUND' from 'StatusCodes'
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;