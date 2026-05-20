import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import listEndpoints from 'express-list-endpoints';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import config from './app/config/init.js';
import { connectDatabase, disconnectDatabase } from './app/config/db.conf.js';
import initMiddleware from './app/middleware/init.js';
import routes from './app/routes/App.routes.js';
import { errorHandler, notFoundHandler } from './app/middleware/ErrorHandler.middleware.js';
import logger from './app/utils/Logger.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// BigInt JSON serialization support
BigInt.prototype.toJSON = function () {
  return this.toString();
};

initMiddleware.init(app);

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.app.name,
      version: '1.0.0',
      description: 'Assessment API documentation'
    },
    servers: [{ url: config.app.url }],
    components: {
      securitySchemes: {
        ServiceToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Service-Token',
          description: 'Static service token for authentication'
        }
      }
    },
    security: [
      {
        ServiceToken: []
      }
    ]
  },
  apis: [path.join(__dirname, 'app', 'routes', '*.js')]
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', routes);
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.app.port, async () => {
  await connectDatabase();
  logger.info(`${config.app.name} running at ${config.app.url}`);
  logger.info(`Available endpoints: ${listEndpoints(app).length}`);
});

const shutdown = async () => {
  logger.info('Shutting down application');
  await disconnectDatabase();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
