const { body } = require('express-validator');
const common = require('./common');
const validate = require('./validate');

const createEvent = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description').optional().trim(),
  body('date')
    .trim()
    .notEmpty()
    .withMessage('Date is required'),
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Time is required'),
  validate,
];

const updateEvent = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('date').optional().trim().notEmpty().withMessage('Date cannot be empty'),
  body('time').optional().trim().notEmpty().withMessage('Time cannot be empty'),
  validate,
];

module.exports = {
  createEvent,
  updateEvent,
};
