import * as fs from 'fs';
import * as restify from 'restify';
import {config} from './config/Config'

/**
 * Create the server
 */
export let api = restify.createServer({
    name: config.name
});

/**
 * Load all the routes in the `routes` folder
 */
fs.readdirSync(__dirname + '/routes').forEach(function (routeConfig: string) {
    let route = require(__dirname + '/routes/' + routeConfig);
    route.routes(api);
});

/**
 * Start listening on the specify port (config/settings.ts)
 */
api.listen(config.port, function () {
    console.log(`INFO: ${config.name} is running at ${api.url}`)
});