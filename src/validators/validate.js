const { validationResult } = require('express-validator');
const { ValidationError } = require('../errors');

/**
 * Middleware that reads validation result from the request and throws ValidationError
 * with all error messages if any validations failed. Use after validation chain middlewares.
 */
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const messages = result.array().map((e) => e.msg);
  throw new ValidationError(messages.join('; '));
}

module.exports = validate;
