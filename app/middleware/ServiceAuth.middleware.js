import { buildResponse } from '../helpers/App.helper.js';

/**
 * Middleware to validate X-Service-Token header
 */
const serviceAuth = (req, res, next) => {
  const serviceToken = req.headers['x-service-token'];
  const expectedToken = process.env.SERVICE_TOKEN;

  if (!expectedToken) {
    return res.status(500).json(
      buildResponse(false, 'Service token is not configured on server')
    );
  }

  if (!serviceToken || serviceToken !== expectedToken) {
    return res.status(401).json(
      buildResponse(false, 'Unauthorized: Invalid or missing X-Service-Token')
    );
  }

  next();
};

export default serviceAuth;
