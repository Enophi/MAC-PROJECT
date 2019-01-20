import * as restify from 'restify';
import RC from '../controllers/RecipeRouteController';

/**
 * Setup all routes for the Recipe routes
 * @param api The restify server instance
 */
function addRecipeRoutes(api: restify.Server) {
    let ctrl = RC.getInstance();
    api.post('/recipe', ctrl.addRecipe);
    api.get('/recipes', ctrl.getAllRecipes);
    api.get('/recipe/:id', ctrl.getRecipe);
    api.del('/recipe/:id', ctrl.deleteRecipe);
    api.put('/recipe/:id', ctrl.updateRecipe);
    api.post('/recipe/like/:id', ctrl.liked);
}

module.exports.routes = addRecipeRoutes;
