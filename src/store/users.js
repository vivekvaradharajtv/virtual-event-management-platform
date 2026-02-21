const { NotFoundError } = require('../errors');
const { generateId } = require('./idGenerator');

const users = new Map();
const byEmail = new Map();

function create({ email, passwordHash, name, role = 'attendee' }) {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const user = {
    id,
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: role === 'organizer' ? 'organizer' : 'attendee',
    createdAt,
  };
  users.set(id, user);
  byEmail.set(user.email, user);
  return user;
}

function getById(id) {
  return users.get(id) || null;
}

function getByEmail(email) {
  return byEmail.get((email || '').toLowerCase()) || null;
}

function getByIdOrThrow(id) {
  const user = users.get(id);
  if (!user) throw new NotFoundError('User', id);
  return user;
}

function reset() {
  users.clear();
  byEmail.clear();
}

module.exports = {
  create,
  getById,
  getByEmail,
  getByIdOrThrow,
  reset,
};
