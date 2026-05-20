import listEndpoints from 'express-list-endpoints';
import app from '../../server.js';

const routes = listEndpoints(app);

console.log('\n--- API Route List ---');
console.table(routes.map(r => ({
  Methods: r.methods.join(', '),
  Path: r.path
})));
console.log(`Total Endpoints: ${routes.length}\n`);

process.exit(0);
