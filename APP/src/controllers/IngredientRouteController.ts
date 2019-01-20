import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class IngredientRouteController {
    private static _instance: IngredientRouteController = new IngredientRouteController();

    /**
     * constructor
     */
    constructor() {
      if (IngredientRouteController._instance) {
        throw new Error("Error: Instantiation failed: Use IngredientRouteController.getInstance() instead of new.")
      }
      IngredientRouteController._instance = this;
    }


    /**
     * Return the singleton instance of IngredientRouteController
     */
    public static getInstance(): IngredientRouteController {
      return IngredientRouteController._instance;
    }

    /**
     * Get all ingredients
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public getAllIngredients(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query: string = "MATCH (i:Ingredient) RETURN i"

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            IngredientRouteController.getInstance().showIngredients(result, res);
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
        let query: string = 'MATCH (i:Ingredient) WHERE toLower(i.name) STARTS WITH toLower($match) RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {
            IngredientRouteController.getInstance().showIngredients(result, res);
        }, {'match':match});
    }

    /**
     * Show ingredients used by getQ and getAllIngredients
     * @param result The result from cypher query
     * @param res result parameter
     */
    private showIngredients(result: Array<any>, res:restify.Response){
      let ingredients :Array<any> = [];
      result.forEach( r => {
        let id    = r.identity.low;
        let name  = r.properties.name;
        ingredients.push({'id':id, 'name':name});
      })
      res.json(200, ingredients);
    }

    /**
     * Get an ingredient
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
    public getIngredient(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id: string = req.params.id;
        let query: string = 'MATCH (i:Ingredient) WHERE ID(i) = toInteger($id) RETURN i';

        DatabaseController.getInstance().makeCipherQuery(query, 'i', r => {
            if(r.length == 0) res.json(200, r);
            let id    = r[0].identity.low;
            let name  = r[0].properties.name;
            res.json(200, {'id':id, 'name':name});
        }, {'id':id});
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
