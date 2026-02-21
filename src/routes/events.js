const express = require('express');
const router = express.Router();
const { authenticate, requireRole, requireEventOwner } = require('../middleware/auth');
const { events: eventValidators } = require('../validators');
const eventsController = require('../controllers/eventsController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(eventsController.list));
router.get('/:id', asyncHandler(eventsController.getById));

router.post(
  '/',
  authenticate,
  requireRole('organizer'),
  eventValidators.createEvent,
  asyncHandler(eventsController.create)
);

router.put(
  '/:id',
  authenticate,
  requireEventOwner,
  eventValidators.updateEvent,
  asyncHandler(eventsController.update)
);

router.delete(
  '/:id',
  authenticate,
  requireEventOwner,
  asyncHandler(eventsController.remove)
);

router.post(
  '/:id/register',
  authenticate,
  asyncHandler(eventsController.registerForEvent)
);

module.exports = router;
