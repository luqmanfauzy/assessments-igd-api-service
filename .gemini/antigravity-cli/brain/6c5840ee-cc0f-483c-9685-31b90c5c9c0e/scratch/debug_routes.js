import app from '../../../../../Documents/Programming/Javascript/assessment-api/server.js';

console.log("=== INSPECTING EXPRESS APP ROUTER ===");
console.log("app.router:", app.router);
if (app.router) {
  console.log("app.router keys:", Object.keys(app.router));
  if (app.router.stack) {
    console.log("app.router.stack length:", app.router.stack.length);
    app.router.stack.forEach((layer, idx) => {
      console.log(`Layer ${idx}: name=${layer.name}, regexp=${layer.regexp}, route=${layer.route ? 'yes' : 'no'}`);
      if (layer.route) {
        console.log(`  Route methods:`, Object.keys(layer.route.methods), `path:`, layer.route.path);
      }
      if (layer.handle && layer.handle.stack) {
        console.log(`  Substack length:`, layer.handle.stack.length);
        layer.handle.stack.forEach((sub, subIdx) => {
          console.log(`    Sublayer ${subIdx}: name=${sub.name}, route=${sub.route ? 'yes' : 'no'}`);
          if (sub.route) {
            console.log(`      Subroute methods:`, Object.keys(sub.route.methods), `path:`, sub.route.path);
          }
        });
      }
    });
  }
} else {
  console.log("No app.router found.");
}
process.exit(0);
