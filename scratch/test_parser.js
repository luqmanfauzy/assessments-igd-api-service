import app from '../server.js';

function getRoutes(router, prefix = '') {
  let routes = [];
  const stack = router.stack || (router._router && router._router.stack);
  if (!stack) return routes;

  for (const layer of stack) {
    if (layer.route) {
      // It's a direct route on this router
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      routes.push({ methods, path });
    } else if (layer.name === 'router' && layer.handle) {
      // It's a sub-router (e.g. router.use('/api', subRouter))
      // In Express 5, path matching is handled by matchers or keys. Let's see how we can get the mount path.
      // Wait, let's inspect the layer of the sub-router.
      console.log('Router Layer Keys:', Object.keys(layer));
      console.log('Router Layer Name:', layer.name);
      console.log('Router Layer Keys Property:', layer.keys);
      console.log('Router Layer handle stack length:', layer.handle?.stack?.length);
      console.log('Router Layer params:', layer.params);
      console.log('Router Layer matchers:', layer.matchers);
      
      // Let's see if we can extract path prefix from layer.matchers or layer.keys
      // In Express, route prefixes for routers mounted with app.use('/prefix', router)
      // are usually matched by RegExp. In Express 5, layer.matchers is used.
    }
  }

  return routes;
}

const r = app.router || app._router;
console.log('Total routes found:', getRoutes(r).length);
process.exit(0);
