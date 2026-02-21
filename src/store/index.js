const userStore = require('./users');
const eventStore = require('./events');

function resetStores() {
  userStore.reset();
  eventStore.reset();
}

module.exports = {
  userStore,
  eventStore,
  resetStores,
};
