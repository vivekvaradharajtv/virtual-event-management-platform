const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id != null
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

module.exports = NotFoundError;
