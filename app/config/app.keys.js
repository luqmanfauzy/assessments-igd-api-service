import dotenv from 'dotenv';
dotenv.config();

export default {
  appKey: process.env.APP_KEY || 'change_this_app_key'
};
