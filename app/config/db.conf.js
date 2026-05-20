import { PrismaClient } from '@prisma/client';
import dbKeys from './db.keys.js';
import logger from '../utils/Logger.util.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbKeys.databaseUrl
    }
  }
});

const connectDatabase = async () => {
  await prisma.$connect();
  logger.info('MySQL database connected through Prisma');
};

const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info('MySQL database disconnected');
};

export {
  prisma,
  connectDatabase,
  disconnectDatabase
};
