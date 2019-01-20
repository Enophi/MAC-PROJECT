import * as restify from 'restify';
import Controller from '../controllers/UserRouteController';
import { DatabaseController } from "../controllers/DatabaseController";

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addUserRoutes(api: restify.Server) {
    let ctrl = new Controller();
    api.get('/login', ctrl.loginUser);
    api.post('/register', ctrl.saveUser);
    api.post('/user/follow/:email', ctrl.followUser);
    api.del('/user/unfollow/:email', ctrl.unfollowUser);
}

module.exports.routes = addUserRoutes;
