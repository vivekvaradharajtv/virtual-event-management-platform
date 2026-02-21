const bcrypt = require('bcryptjs');
const { userStore, eventStore, resetStores } = require('../src/store');

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function createTestUser(overrides = {}) {
  const { password: pwd, passwordHash: existingHash, ...rest } = overrides;
  const passwordHash = existingHash ?? (await bcrypt.hash(pwd || 'password123', 10));
  return userStore.create({
    email: 'test@example.com',
    name: 'Test User',
    role: 'attendee',
    ...rest,
    passwordHash,
  });
}

function createTestEvent(overrides = {}) {
  return eventStore.create({
    title: 'Test Event',
    description: 'A test event',
    date: '2025-06-01',
    time: '14:00',
    organizerId: overrides.organizerId || 'some-user-id',
    ...overrides,
  });
}

module.exports = {
  authHeader,
  createTestUser,
  createTestEvent,
  resetStores,
};
