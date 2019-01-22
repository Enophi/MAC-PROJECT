import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";
import * as _ from "lodash";

export default class RecommendationController {

    private static _instance: RecommendationController = new RecommendationController();

    /**
     * constructor
     */
    constructor() {
        if (RecommendationController._instance) {
            throw new Error("Error: Instantiation failed: Use RecommendationController.getInstance() instead of new.")
        }
        RecommendationController._instance = this;
    }

    /**
     * Return the singleton instance of RecipeRouteController
     */
    public static getInstance(): RecommendationController {
        return RecommendationController._instance;
    }

    /*
    * Return the recommendation recipes for a user.
    * The recommendation system calculate the rank of a recipe base on two factor :
    * 1. The frequency of a recipe base on ingredients
    * 2. The depth of the recipe base on the FOLLOW relation
    * 
    * The rank calculation is : depth * occurence * alpha
    * where alpha is a factor based on the difference between the two lists.
    * If a recipe come from list A (less important) its factor is 0.5
    * If a recipe come from list B (more important) its factor is 1
    * If a recipe come from lists A and B, its factor is 2
    */
    public getRecommendation(req: restify.Request, res: restify.Response, next: restify.Next) {

        const FOLLOW_FACTOR: number = 0.5;
        const INGREDIENT_FACTOR: number = 2;

        let user = req.headers.authorization;

        let query: string = 'MATCH (u:User)-[f:FOLLOW*1..2]->(ou:User)-[:PUBLISH]->(rec:Recipe) '
            + 'WHERE u.email = $userEmailFrom '
            + 'AND NOT (u)-[:LIKE]->(rec) '
            + 'WITH rec, LENGTH(f) as depth '
            + 'RETURN rec, depth';

        let query2: string = 'MATCH (u:User)-[:LIKE]->(:Ingredient)<-[:HAS]-(rec:Recipe) '
            + 'WHERE u.email = $userEmailFrom '
            + 'AND NOT (u)-[:LIKE]->(rec) '
            + 'WITH rec, COUNT(rec.name) as count '
            + 'RETURN rec, count';

        DatabaseController.getInstance().makeCipherQueryMultipleReturn(query, ['rec', 'depth'], candidatesByFollow => {
            DatabaseController.getInstance().makeCipherQueryMultipleReturn(query2, ['rec', 'count'], candidatesByIngredients => {
                var tempResult: Map<number, any> = new Map();
                var finalResult: Array<any> = [];

                _.forEach(candidatesByIngredients, cbi => {
                    tempResult.set(cbi.rec.identity.low, { 'rank': cbi.count.low, 'recipe': cbi.rec });
                });

                _.forEach(candidatesByFollow, cbf => {
                    if (tempResult.has(cbf.rec.identity.low)) {
                        var temp = tempResult.get(cbf.rec.identity.low);
                        temp.rank *= INGREDIENT_FACTOR * cbf.depth.low;
                        tempResult.set(cbf.rec.identity.low, temp);
                    } else {
                        tempResult.set(cbf.rec.identity.low, { 'rank': cbf.depth.low * FOLLOW_FACTOR, 'recipe': cbf.rec });
                    }
                });

                tempResult.forEach((v, k) => {

                    finalResult.push({
                        'rank': v.rank,
                        'recipe': {
                            'id': k,
                            'name': v.recipe.properties.name
                        }
                    })
                });

                // We recommend the first three
                finalResult = _.reverse(_.sortBy(finalResult, ['rank'])).slice(0, 3)

                res.json(200, finalResult);

            }, { 'userEmailFrom': user });

        }, { 'userEmailFrom': user })
    }
}