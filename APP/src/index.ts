import * as fs from 'fs';
import * as restify from 'restify';
import { config } from './config/Config'
import pino from 'pino';

// LOGGER
const L = pino();

/**
 * Create the server
 */
export let api = restify.createServer({
    name: config.name
});

api.use(restify.plugins.queryParser());
api.use(restify.plugins.bodyParser());

/**
 * Load all the routes in the `routes` folders
 */
fs.readdirSync(__dirname + '/routes').forEach(function (routeConfig: string) {
    let route = require(__dirname + '/routes/' + routeConfig);
    route.routes(api);
});

/**
 * Start listening on the specify port (config/settings.ts)
 */
api.listen(config.port, function () {
    L.info(`INFO: ${config.name} is running at ${api.url}`)
});