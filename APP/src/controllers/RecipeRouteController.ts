import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class RecipeRouteController {

    public getAllRecipes(req: restify.Request, res: restify.Response, next: restify.Next) {
        DatabaseController.getInstance().neo.all('Recipe').then(collection => {
            return collection.toJson();
        }).then(json => {
            console.log(json)
            res.json(200, json);
            next();
        }).catch((e) => {
            console.log("ERROR: " + e);
            next(false);
        });
    }

}