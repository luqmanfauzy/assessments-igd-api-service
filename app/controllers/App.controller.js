import { buildResponse } from '../helpers/App.helper.js';

const home = (req, res) => {
  return res.json(buildResponse(true, 'Selamat datang di Assessment API', {
    message: 'Express JS API dengan Prisma dan MySQL'
  }));
};

const health = (req, res) => {
  return res.json(buildResponse(true, 'API sedang berjalan', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }));
};

export default {
  home,
  health
};
