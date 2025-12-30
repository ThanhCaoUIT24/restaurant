const info = (...args) => console.log('[INFO]', ...args);
const error = (...args) => console.error('[ERROR]', ...args);

const logger = { info, error };

module.exports = { logger };
