const request = require('supertest');
const express = require('express');
const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  errorHandler,
} = require('../src/errors');
const asyncHandler = require('../src/utils/asyncHandler');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get(
    '/test/validation',
    asyncHandler(async () => {
      throw new ValidationError('Invalid email format');
    })
  );
  app.get(
    '/test/unauthorized',
    asyncHandler(async () => {
      throw new UnauthorizedError('Token required');
    })
  );
  app.get(
    '/test/forbidden',
    asyncHandler(async () => {
      throw new ForbiddenError('Not allowed to access this resource');
    })
  );
  app.get(
    '/test/not-found',
    asyncHandler(async () => {
      throw new NotFoundError('Event', 'evt-123');
    })
  );
  app.get(
    '/test/conflict',
    asyncHandler(async () => {
      throw new ConflictError('Email already registered');
    })
  );
  app.get(
    '/test/unknown',
    asyncHandler(async () => {
      throw new Error('Some unexpected error');
    })
  );

  app.use(errorHandler);
  return app;
}

describe('Error handling', () => {
  const app = createTestApp();

  it('returns 400 and error body for ValidationError', async () => {
    const res = await request(app).get('/test/validation');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      },
    });
  });

  it('returns 401 and error body for UnauthorizedError', async () => {
    const res = await request(app).get('/test/unauthorized');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token required',
      },
    });
  });

  it('returns 403 and error body for ForbiddenError', async () => {
    const res = await request(app).get('/test/forbidden');
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Not allowed to access this resource',
      },
    });
  });

  it('returns 404 and error body for NotFoundError', async () => {
    const res = await request(app).get('/test/not-found');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: expect.stringContaining('Event'),
      },
    });
  });

  it('returns 409 and error body for ConflictError', async () => {
    const res = await request(app).get('/test/conflict');
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Email already registered',
      },
    });
  });

  it('returns 500 and generic message for unknown errors', async () => {
    const res = await request(app).get('/test/unknown');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBeDefined();
  });
});
