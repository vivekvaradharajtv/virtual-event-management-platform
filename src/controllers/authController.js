const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userStore } = require('../store');
const { ConflictError, UnauthorizedError } = require('../errors');
const { successRes } = require('../utils/response');
const config = require('../config');

function toUserResponse(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function register(req, res) {
  const { email, password, name, role } = req.body;
  const existing = userStore.getByEmail(email);
  if (existing) throw new ConflictError('Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = userStore.create({
    email,
    passwordHash,
    name,
    role: role || 'attendee',
  });
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
  return successRes(res, 201, {
    user: toUserResponse(user),
    token,
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = userStore.getByEmail(email);
  if (!user) throw new UnauthorizedError('Invalid email or password');
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new UnauthorizedError('Invalid email or password');
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
  return successRes(res, 200, {
    user: toUserResponse(user),
    token,
  });
}

module.exports = {
  register,
  login,
};
