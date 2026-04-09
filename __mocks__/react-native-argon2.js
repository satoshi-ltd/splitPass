const { createHash } = require('node:crypto');

module.exports = jest.fn(async (password = '', salt = '', config = {}) => {
  const normalized = `${password}::${salt}::${JSON.stringify(config || {})}`;
  const rawHash = createHash('sha256').update(normalized).digest('hex');

  return {
    encodedHash: `$argon2id$mock$${rawHash}`,
    rawHash,
  };
});
