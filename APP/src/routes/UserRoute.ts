import * as restify from 'restify';
import Controller from '../controllers/UserRouteController';
import {DatabaseController} from "../controllers/DatabaseController";

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addUserRoutes(api: restify.Server) {
    let ctrl = new Controller();
}

module.exports.routes = addUserRoutes;
