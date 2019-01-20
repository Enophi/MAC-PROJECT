import * as restify from 'restify';
import Controller from '../controllers/IngredientRouteController';

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addIngredientRoutes(api: restify.Server) {
    let ctrl = new Controller();
    api.get('/ingredients', ctrl.getAllIngredients);
    api.get('/ingredients/q', ctrl.getQ);
    api.get('/ingredient/:id', ctrl.getIngredient);
    api.post('/ingredient/like/:id', ctrl.liked);
    api.del('/ingredient/unlike/:id', ctrl.unliked);
}

module.exports.routes = addIngredientRoutes;
