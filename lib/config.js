/**
 * Load .env and expose config. All sensitive and environment-specific values
 * should be read from process.env (set in .env); only safe defaults here.
 */
require('dotenv').config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI || '',
  PORT: Number(process.env.PORT) || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'nesebar.admin.sid',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  DEFAULT_HOST: process.env.DEFAULT_HOST || 'localhost:3000',
};
