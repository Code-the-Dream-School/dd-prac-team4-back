const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class BadRequestError extends CustomAPIError { // Define a custom 'BadRequestError' class that extends the 'CustomAPIError' class
  constructor(message) {
    // Call the parent class constructor with the provided error message
    super(message);
    // Set the 'statusCode' property of the error to 'BAD_REQUEST' from 'StatusCodes'
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;