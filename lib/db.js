const mongoose = require('mongoose');

/** True when MongoDB is connected (readyState === 1). Avoids buffering timeouts when Atlas is unreachable. */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { isConnected };
