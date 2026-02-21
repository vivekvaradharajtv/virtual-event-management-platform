const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const eventsRoutes = require('../src/routes/events');
const { errorHandler } = require('../src/errors');
const { resetStores, createTestUser, createTestEvent, authHeader } = require('./helpers');

jest.mock('../src/services/email', () => ({
  sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
}));

const emailService = require('../src/services/email');

function createRegistrationApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  app.use('/events', eventsRoutes);
  app.use(errorHandler);
  return app;
}

describe('Event registration', () => {
  const app = createRegistrationApp();

  beforeEach(() => {
    resetStores();
    emailService.sendRegistrationEmail.mockClear();
  });

  async function getAuthToken() {
    const user = await createTestUser({ email: 'user@test.com', password: 'pass' });
    const res = await request(app).post('/login').send({ email: 'user@test.com', password: 'pass' });
    return { user, token: res.body.data.token };
  }

  it('returns 201 and registers user for event, sends email', async () => {
    const { user, token } = await getAuthToken();
    const event = createTestEvent({ title: 'Meetup', organizerId: 'other-id' });
    const res = await request(app)
      .post(`/events/${event.id}/register`)
      .set(authHeader(token));
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.participantIds).toContain(user.id);
    expect(emailService.sendRegistrationEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(
      user.email,
      expect.objectContaining({ id: event.id, title: 'Meetup' })
    );
  });

  it('returns 409 when already registered', async () => {
    const { user, token } = await getAuthToken();
    const event = createTestEvent({ organizerId: 'other-id' });
    await request(app)
      .post(`/events/${event.id}/register`)
      .set(authHeader(token));
    const res = await request(app)
      .post(`/events/${event.id}/register`)
      .set(authHeader(token));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(emailService.sendRegistrationEmail).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when event not found', async () => {
    const { token } = await getAuthToken();
    const res = await request(app)
      .post('/events/non-existent-id/register')
      .set(authHeader(token));
    expect(res.status).toBe(404);
    expect(emailService.sendRegistrationEmail).not.toHaveBeenCalled();
  });

  it('returns 401 when not authenticated', async () => {
    const event = createTestEvent({ title: 'E' });
    const res = await request(app).post(`/events/${event.id}/register`);
    expect(res.status).toBe(401);
    expect(emailService.sendRegistrationEmail).not.toHaveBeenCalled();
  });
});
