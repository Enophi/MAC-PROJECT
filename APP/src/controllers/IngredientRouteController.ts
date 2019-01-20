import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class IngredientRouteController {

    /**
     * Get all ingredients
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public getAllIngredients(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query: string = "MATCH (i:Ingredient) RETURN i"

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            res.json(200, result);
        });
    }

    /**
     * Query an ingredient matching the beginning of the given string
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public getQ(req: restify.Request, res: restify.Response, next: restify.Next) {
        let match: string = req.query.match;
        let query: string = 'MATCH (i:Ingredient) WHERE toLower(i.name) STARTS WITH toLower(\'' + match + '\') RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            res.json(200, result);
        });
    }

    /**
     * Get an ingredient
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public getIngredient(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id: string = req.params.id;
        let query: string = 'MATCH (i:Ingredient) WHERE ID(i) = ' + id + ' RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            res.json(200, result);
        });
    }

    /**
     * Like an ingredient
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public liked(req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: any = req.headers.authorization;
        let ingredient: number = req.params.id;

        let queryRel: string = "MATCH (u:User),(i:Ingredient)"
            + " WHERE u.email = $user AND ID(i) = toInteger($id)"
            + " MERGE (u)-[rel:LIKE]->(i)"
            + " RETURN rel";

        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
            if (result.length == 0) res.json(401, {'status': 'nok' });
            else res.json(200, 1);
        }, {'user':user, 'id':ingredient});
    }

    /**
     * Unlike an ingredient
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public unliked(req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: any = req.headers.authorization;
        let ingredient: number = req.params.id;

        let queryRel: string = "MATCH (u:User),(i:Ingredient)"
            + " WHERE u.email = $user AND ID(i) = toInteger($id)"
            + " MATCH (u)-[rel:LIKE]->(i)"
            + " DELETE rel"
            + " RETURN rel";

        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
            if (result.length == 0) res.json(401, {'status': 'nok' });
            else res.json(200, 1);
        }, {'user':user, 'id':ingredient});
    }

}
