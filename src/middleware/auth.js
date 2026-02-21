const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../errors');
const { userStore } = require('../store');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  if (!token) {
    throw new UnauthorizedError('Token required');
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = userStore.getById(payload.userId);
    if (!user) throw new UnauthorizedError('User not found');
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Invalid or expired token');
    }
    throw err;
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) return next();
    throw new ForbiddenError(`Role '${role}' required`);
  };
}

module.exports = {
  authenticate,
  requireRole,
};
