import * as restify from 'restify';
import RC from '../controllers/RecipeRouteController';

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addRecipeRoutes(api: restify.Server) {
    let ctrl = new RC();
    api.get('/recipes', ctrl.getAllRecipes);
    api.get('/recipes2', ctrl.getAllRecipes2);
    api.post('/recipe', ctrl.addRecipe);
}

module.exports.routes = addRecipeRoutes;
