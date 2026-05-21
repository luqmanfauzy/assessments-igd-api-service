import app from '../server.js';

console.log('App keys:', Object.keys(app));
console.log('Router:', app.router);
console.log('_router:', app._router);

// Let's trigger router initialization if it's lazy in Express 5
if (app.lazyrouter) {
  app.lazyrouter();
}
console.log('After lazyrouter _router:', app._router);
if (app._router) {
  console.log('Stack length:', app._router.stack?.length);
  console.log('Stack:', app._router.stack);
}

process.exit(0);
