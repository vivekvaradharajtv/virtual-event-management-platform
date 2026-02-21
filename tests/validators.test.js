const request = require('supertest');
const express = require('express');
const { auth, events } = require('../src/validators');
const { errorHandler } = require('../src/errors');
const asyncHandler = require('../src/utils/asyncHandler');
const { successRes } = require('../src/utils/response');

function createValidatorTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/register', auth.register, asyncHandler(async (req, res) => {
    successRes(res, 201, { registered: true });
  }));

  app.post('/login', auth.login, asyncHandler(async (req, res) => {
    successRes(res, 200, { token: 'fake' });
  }));

  app.post('/events', events.createEvent, asyncHandler(async (req, res) => {
    successRes(res, 201, { created: true });
  }));

  app.put('/events/:id', events.updateEvent, asyncHandler(async (req, res) => {
    successRes(res, 200, { updated: true });
  }));

  app.use(errorHandler);
  return app;
}

describe('Validators', () => {
  const app = createValidatorTestApp();

  describe('auth.register', () => {
    it('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'not-an-email', password: '123456', name: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toMatch(/email|invalid/i);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'a@b.com', password: '12345', name: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/6|password/i);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'a@b.com', password: '123456' });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/name/i);
    });

    it('passes with valid body', async () => {
      const res = await request(app)
        .post('/register')
        .send({ email: 'a@b.com', password: '123456', name: 'Alice' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('auth.login', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({ password: '123456' });
      expect(res.status).toBe(400);
    });

    it('passes with valid body', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'a@b.com', password: 'secret' });
      expect(res.status).toBe(200);
    });
  });

  describe('events.createEvent', () => {
    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/events')
        .send({ description: 'Desc', date: '2025-01-01', time: '10:00' });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/title/i);
    });

    it('passes with valid body', async () => {
      const res = await request(app)
        .post('/events')
        .send({
          title: 'Meetup',
          description: 'A meetup',
          date: '2025-03-01',
          time: '10:00',
        });
      expect(res.status).toBe(201);
    });
  });
});
