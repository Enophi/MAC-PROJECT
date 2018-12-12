import * as restify from 'restify';
import Controller from '../controllers/IngredientRouteController';

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addIngredientRoutes(api: restify.Server) {
    let ctrl = new Controller();
    api.get('/ingredients', ctrl.getAll);
}

module.exports.routes = addIngredientRoutes;
