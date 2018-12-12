import * as restify from 'restify';
import Controller from '../controllers/UserRouteController';

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addUserRoutes(api: restify.Server) {
    let ctrl = new Controller();
    api.get('/users', ctrl.getAll);
}

module.exports.routes = addUserRoutes;
