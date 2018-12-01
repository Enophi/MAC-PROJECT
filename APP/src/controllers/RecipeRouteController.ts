import * as restify from 'restify';

export default class RecipeRouteController {

    public getAllRecipes(req: restify.Request, res: restify.Response, next: restify.Next) {
        res.json(200, 'simple response');
        return next();
    }

}