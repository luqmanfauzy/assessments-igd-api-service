import { buildResponse } from '../helpers/App.helper.js';
import logger from '../utils/Logger.util.js';

const notFoundHandler = (req, res) => {
  return res.status(404).json(buildResponse(false, 'Route not found'));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message, err);

  return res.status(statusCode).json(
    buildResponse(false, err.message || 'Internal server error', null, {
      path: req.originalUrl
    })
  );
};

export {
  notFoundHandler,
  errorHandler
};
