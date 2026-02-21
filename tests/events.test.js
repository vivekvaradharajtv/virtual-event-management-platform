const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const eventsRoutes = require('../src/routes/events');
const { errorHandler } = require('../src/errors');
const { resetStores, createTestUser, createTestEvent, authHeader } = require('./helpers');

function createEventsApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  app.use('/events', eventsRoutes);
  app.use(errorHandler);
  return app;
}

describe('Events CRUD', () => {
  const app = createEventsApp();

  beforeEach(() => {
    resetStores();
  });

  async function getOrganizerToken() {
    const user = await createTestUser({ email: 'org@test.com', password: 'pass', role: 'organizer' });
    const res = await request(app).post('/login').send({ email: 'org@test.com', password: 'pass' });
    return { user, token: res.body.data.token };
  }

  async function getAttendeeToken() {
    await createTestUser({ email: 'att@test.com', password: 'pass', role: 'attendee' });
    const res = await request(app).post('/login').send({ email: 'att@test.com', password: 'pass' });
    return res.body.data.token;
  }

  describe('GET /events', () => {
    it('returns 200 and list of events', async () => {
      const res = await request(app).get('/events');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns created events', async () => {
      const event = createTestEvent({ title: 'Meetup', organizerId: 'u1' });
      const res = await request(app).get('/events');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Meetup');
    });
  });

  describe('GET /events/:id', () => {
    it('returns 200 and event when found', async () => {
      const event = createTestEvent({ title: 'One' });
      const res = await request(app).get(`/events/${event.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(event.id);
      expect(res.body.data.title).toBe('One');
    });

    it('returns 404 when event not found', async () => {
      const res = await request(app).get('/events/non-existent-id');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /events', () => {
    it('returns 401 when no token', async () => {
      const res = await request(app)
        .post('/events')
        .send({ title: 'E', description: '', date: '2025-01-01', time: '10:00' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is attendee', async () => {
      const token = await getAttendeeToken();
      const res = await request(app)
        .post('/events')
        .set(authHeader(token))
        .send({ title: 'E', description: '', date: '2025-01-01', time: '10:00' });
      expect(res.status).toBe(403);
    });

    it('returns 201 and event when organizer', async () => {
      const { user, token } = await getOrganizerToken();
      const res = await request(app)
        .post('/events')
        .set(authHeader(token))
        .send({
          title: 'Conference',
          description: 'A conference',
          date: '2025-06-15',
          time: '09:00',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Conference');
      expect(res.body.data.organizerId).toBe(user.id);
      expect(res.body.data.participantIds).toEqual([]);
    });
  });

  describe('PUT /events/:id', () => {
    it('returns 401 when no token', async () => {
      const event = createTestEvent({ title: 'E' });
      const res = await request(app)
        .put(`/events/${event.id}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when not owner', async () => {
      const { user } = await getOrganizerToken();
      const otherEvent = createTestEvent({ title: 'Other', organizerId: 'different-id' });
      const token = (await getOrganizerToken()).token;
      const res = await request(app)
        .put(`/events/${otherEvent.id}`)
        .set(authHeader(token))
        .send({ title: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('returns 200 and updated event when owner', async () => {
      const { user, token } = await getOrganizerToken();
      const event = createTestEvent({ title: 'Mine', organizerId: user.id });
      const res = await request(app)
        .put(`/events/${event.id}`)
        .set(authHeader(token))
        .send({ title: 'Updated Title', time: '14:00' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.time).toBe('14:00');
    });
  });

  describe('DELETE /events/:id', () => {
    it('returns 401 when no token', async () => {
      const event = createTestEvent({ title: 'E' });
      const res = await request(app).delete(`/events/${event.id}`);
      expect(res.status).toBe(401);
    });

    it('returns 403 when not owner', async () => {
      await getOrganizerToken();
      const otherEvent = createTestEvent({ organizerId: 'other-id' });
      const token = (await getOrganizerToken()).token;
      const res = await request(app)
        .delete(`/events/${otherEvent.id}`)
        .set(authHeader(token));
      expect(res.status).toBe(403);
    });

    it('returns 204 when owner', async () => {
      const { user, token } = await getOrganizerToken();
      const event = createTestEvent({ organizerId: user.id });
      const res = await request(app)
        .delete(`/events/${event.id}`)
        .set(authHeader(token));
      expect(res.status).toBe(204);
      const getRes = await request(app).get(`/events/${event.id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
