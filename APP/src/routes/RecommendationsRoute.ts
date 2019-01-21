import * as restify from 'restify';
import RC from '../controllers/RecommendationController';

/**
 * Setup all routes for the Recommendation routes
 * @param api The restify server instance
 */
function addRecommendationRoutes(api: restify.Server) {
    let ctrl = RC.getInstance();
    api.get('/recommendation', ctrl.getRecommendation);
}

module.exports.routes = addRecommendationRoutes;
