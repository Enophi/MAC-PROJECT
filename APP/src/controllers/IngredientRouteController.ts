import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class IngredientRouteController {

    public getAllIngredients(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query: string = "MATCH (i:Ingredient) RETURN i"

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            // TODO Do something with result, map with real Object, clean it, whatever...

            res.json(200, result);
        });
    }

    public getQ(req: restify.Request, res: restify.Response, next: restify.Next) {
        let match:string = req.query.match;
        let query: string = 'MATCH (i:Ingredient) WHERE toLower(i.name) STARTS WITH toLower(\'' + match + '\') RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

            // TODO Do something with result, map with real Object, clean it, whatever...
            res.json(200, result);
        });
    }

    public getIngredient(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id:string = req.params.id;
        let query: string = 'MATCH (i:Ingredient) WHERE ID(i) = ' + id + ' RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

            // TODO Do something with result, map with real Object, clean it, whatever...
            res.json(200, result);
        });
    }
}
