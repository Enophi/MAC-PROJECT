import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class IngredientRouteController {

    public getAll(req: restify.Request, res: restify.Response, next: restify.Next) {
        DatabaseController.getInstance().neo.all('Ingredient').then(collection => {
            return collection.toJson();
        }).then(json => {
            console.log(json)
            res.json(200, json);
            next();
        }).catch((e) => {
            console.log("ERROR: " + e);
            res.send(500, {error:e})
            next(false);
        });
    }

}
