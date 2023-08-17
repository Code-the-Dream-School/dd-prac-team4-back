class CustomAPIError extends Error {
  // Define a custom error class named 'CustomAPIError' that extends the built-in 'Error' class
  constructor(message) {
    super(message); // Call the constructor of the parent class ('Error') and pass the error message
  }
}

module.exports = CustomAPIError;
