import logger from '../utils/Logger.util.js';

const connectMongo = async () => {
  logger.info('MongoDB is not configured yet');
};

export {
  connectMongo
};
