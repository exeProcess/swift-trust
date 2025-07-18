const NodeCache = require("node-cache");

// Cache with default TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

module.exports = cache;
