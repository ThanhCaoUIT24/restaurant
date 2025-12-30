const { logger } = require('../config/logger');

const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
};

module.exports = { notFound, errorHandler };
