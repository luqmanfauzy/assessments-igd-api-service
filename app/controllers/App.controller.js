import { buildResponse } from '../helpers/App.helper.js';

const home = (req, res) => {
  return res.json(buildResponse(true, 'Welcome to Assessment API', {
    message: 'Express JS API with Prisma and MySQL'
  }));
};

const about = (req, res) => {
  return res.json(buildResponse(true, 'About Assessment API', {
    description: 'This is a technical assessment project.'
  }));
};

const contact = (req, res) => {
  return res.json(buildResponse(true, 'Contact Details', {
    email: 'support@example.com'
  }));
};

const health = (req, res) => {
  return res.json(buildResponse(true, 'API is running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }));
};

export default {
  home,
  about,
  contact,
  health
};
