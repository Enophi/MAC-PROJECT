import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class IngredientRouteController {

    public getAllIngredients(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query: string = "MATCH (i:Ingredient) RETURN i"

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            // TODO Do something with result, map with real Object, clean it, whatever...

            res.json(200, result);
        });
    }

    public getQ(req: restify.Request, res: restify.Response, next: restify.Next) {
        let match: string = req.query.match;
        let query: string = 'MATCH (i:Ingredient) WHERE toLower(i.name) STARTS WITH toLower(\'' + match + '\') RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

            // TODO Do something with result, map with real Object, clean it, whatever...
            res.json(200, result);
        });
    }

    public getIngredient(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id: string = req.params.id;
        let query: string = 'MATCH (i:Ingredient) WHERE ID(i) = ' + id + ' RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

            // TODO Do something with result, map with real Object, clean it, whatever...
            res.json(200, result);
        });
    }

    public liked(req: restify.Request, res: restify.Response, next: restify.Next) {

        let user: number = req.body.user;
        let ingredient: number = req.body.ingredient;

        console.log(req.body);
        console.log(user);
        console.log(ingredient);

        let getIngredient: string = "MATCH (i:Ingredient)"
            + " WHERE  ID(i) = " + ingredient
            + " RETURN i";


        let queryRel: string = "MATCH (u:User),(i:Ingredient)"
            + " WHERE ID(u) = " + user + " AND ID(i) = " + ingredient
            + " MERGE (u)-[rel:LIKE]->(i)"
            + " RETURN rel";


        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
            if (result.length == 0) res.json(401, { 'user': req.body.user, 'status': 'nok' })
            else res.json(200, { 'user': req.body.user, 'status': 'ok' })
        });


    }
}
