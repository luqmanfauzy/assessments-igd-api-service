import logger from '../utils/Logger.util.js';

const connectRedis = async () => {
  logger.info('Redis is not configured yet');
};

export {
  connectRedis
};
