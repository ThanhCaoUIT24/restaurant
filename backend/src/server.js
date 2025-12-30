require('dotenv').config();
const http = require('http');
const app = require('./app');
const { logger } = require('./config/logger');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`);
});
