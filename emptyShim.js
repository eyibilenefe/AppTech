// emptyShim.js
// Whenever Metro resolves one of our Node‐only modules (ws, https, etc.),
// it will load this empty object instead of crashing.

module.exports = {};