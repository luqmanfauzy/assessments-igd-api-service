import appMiddleware from './App.middleware.js';
import serviceAuth from './ServiceAuth.middleware.js';

const init = (app) => {
  appMiddleware(app);
};

export {
  init,
  serviceAuth
};

export default {
  init,
  serviceAuth
};
