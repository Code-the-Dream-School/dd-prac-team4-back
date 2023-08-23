const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api');

class Conflict extends CustomAPIError {
  // Define a custom 'Conflict' class that extends the 'CustomAPIError' class
  constructor(message) {
    // Call the parent class constructor with the provided error message
    super(message);
    // Set the 'statusCode' property of the error to 'Conflict' from 'StatusCodes'
    this.statusCode = StatusCodes.CONFLICT;
  }
}

module.exports = Conflict;
