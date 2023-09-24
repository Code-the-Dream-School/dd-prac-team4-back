const { StatusCodes } = require('http-status-codes');
const logger = require('../../logs/logger');

const errorHandlerMiddleware = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') logger.error(err);

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };

  // handle different mongoose error codes
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.statusCode = 400;
  }
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }
  if (err.name === 'CastError') {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  // return an error response
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
