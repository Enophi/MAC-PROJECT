import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class RecipeRouteController {

    public getAllRecipes(req: restify.Request, res: restify.Response, next: restify.Next) {
        DatabaseController.getInstance().neo.all('Recipe').then(collection => {
            return collection.toJson();
        }).then(json => {
            res.json(200, json);
            console.log(json)
        }).catch(() => {
            console.log("ERROR: getAll('Recipe)");
        });

        return next();
    }

}