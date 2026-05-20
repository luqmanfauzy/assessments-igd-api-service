import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import appConfig from '../config/app.conf.js';

const appMiddleware = (app) => {
  app.use(cors({ origin: appConfig.corsOrigin }));
  app.use(morgan(appConfig.logLevel));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(process.cwd(), 'app', 'public')));
};

export default appMiddleware;
