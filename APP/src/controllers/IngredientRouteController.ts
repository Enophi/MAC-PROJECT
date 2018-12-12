import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class IngredientRouteController {

    public getAll(req: restify.Request, res: restify.Response, next: restify.Next) {
        return DatabaseController.getInstance().getAll(req, res, next, 'Ingredient')
    }

}
