require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
};
