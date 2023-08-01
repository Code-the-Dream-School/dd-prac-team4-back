class UnauthorizedError extends Error {
    constructor(message) {
      super(message);
      this.name = "UnauthorizedError";
      this.statusCode = 401;
    }
  }
  
  module.exports = UnauthorizedError;