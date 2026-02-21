const { body } = require('express-validator');

const email = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Invalid email format');

const password = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

const name = body('name')
  .trim()
  .notEmpty()
  .withMessage('Name is required');

const nonEmptyString = (field, message = `${field} is required`) =>
  body(field).trim().notEmpty().withMessage(message);

module.exports = {
  email,
  password,
  name,
  nonEmptyString,
};
