const AppError = require('./AppError');
const config = require('../config');

function errorHandler(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const message =
    err instanceof AppError ? err.message : 'An unexpected error occurred';

  if (statusCode === 500 && config.nodeEnv === 'development' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = errorHandler;
