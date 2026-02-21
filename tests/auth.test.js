const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const { errorHandler } = require('../src/errors');
const { resetStores, createTestUser, authHeader } = require('./helpers');

function createAuthApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  app.use(errorHandler);
  return app;
}

describe('Auth', () => {
  const app = createAuthApp();

  beforeEach(() => {
    resetStores();
  });

  describe('POST /register', () => {
    it('returns 201 with user and token on success', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'alice@example.com',
          password: 'secret123',
          name: 'Alice',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.name).toBe('Alice');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
    });

    it('returns 409 when email already registered', async () => {
      await createTestUser({ email: 'taken@example.com' });
      const res = await request(app)
        .post('/register')
        .send({
          email: 'taken@example.com',
          password: 'secret123',
          name: 'Bob',
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('allows registering as organizer', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'org@example.com',
          password: 'secret123',
          name: 'Organizer',
          role: 'organizer',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('organizer');
    });
  });

  describe('POST /login', () => {
    it('returns 200 with token and user on success', async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'mypassword',
        name: 'Login User',
      });
      const res = await request(app)
        .post('/login')
        .send({ email: 'login@example.com', password: 'mypassword' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('returns 401 when password is wrong', async () => {
      await createTestUser({
        email: 'user@example.com',
        password: 'correct',
      });
      const res = await request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 when email not found', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'nobody@example.com', password: 'any' });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
