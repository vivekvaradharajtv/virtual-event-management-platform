/**
 * Shared test helpers. Extended in later modules (createTestUser, createTestEvent, resetStores, etc.)
 */

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

module.exports = {
  authHeader,
};
