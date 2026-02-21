const { NotFoundError } = require('../errors');
const { generateId } = require('./idGenerator');

const events = new Map();

function create({ title, description, date, time, organizerId }) {
  const id = generateId();
  const now = new Date().toISOString();
  const event = {
    id,
    title,
    description: description || '',
    date,
    time,
    organizerId,
    participantIds: [],
    createdAt: now,
    updatedAt: now,
  };
  events.set(id, event);
  return event;
}

function getAll() {
  return Array.from(events.values());
}

function getById(id) {
  return events.get(id) || null;
}

function getByIdOrThrow(id) {
  const event = events.get(id);
  if (!event) throw new NotFoundError('Event', id);
  return event;
}

function update(id, data) {
  const event = events.get(id);
  if (!event) throw new NotFoundError('Event', id);
  const allowed = ['title', 'description', 'date', 'time'];
  allowed.forEach((key) => {
    if (data[key] !== undefined) event[key] = data[key];
  });
  event.updatedAt = new Date().toISOString();
  return event;
}

function remove(id) {
  const event = events.get(id);
  if (!event) throw new NotFoundError('Event', id);
  events.delete(id);
  return true;
}

function addParticipant(eventId, userId) {
  const event = events.get(eventId);
  if (!event) throw new NotFoundError('Event', eventId);
  if (event.participantIds.includes(userId)) return event;
  event.participantIds.push(userId);
  event.updatedAt = new Date().toISOString();
  return event;
}

function removeParticipant(eventId, userId) {
  const event = events.get(eventId);
  if (!event) throw new NotFoundError('Event', eventId);
  event.participantIds = event.participantIds.filter((id) => id !== userId);
  event.updatedAt = new Date().toISOString();
  return event;
}

function reset() {
  events.clear();
}

module.exports = {
  create,
  getAll,
  getById,
  getByIdOrThrow,
  update,
  remove,
  addParticipant,
  removeParticipant,
  reset,
};
