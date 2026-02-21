const { body } = require('express-validator');
const common = require('./common');
const validate = require('./validate');

const register = [
  common.email,
  common.password,
  common.name,
  body('role')
    .optional()
    .trim()
    .isIn(['organizer', 'attendee'])
    .withMessage('Role must be organizer or attendee'),
  validate,
];

const login = [
  common.email,
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = {
  register,
  login,
};
