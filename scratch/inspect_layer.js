import app from '../server.js';
import util from 'util';

const r = app.router;
const routerLayer = r.stack.find(l => l.name === 'router');

console.log(util.inspect(routerLayer, { depth: null }));
process.exit(0);
