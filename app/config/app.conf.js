import dotenv from 'dotenv';
dotenv.config();

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'Assessment API',
  host: process.env.APP_HOST || 'localhost',
  port: Number(process.env.APP_PORT || 3000),
  url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 3000}`,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'dev'
};

export default appConfig;
