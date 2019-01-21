import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";
import * as _ from "lodash";
import { CLIENT_RENEG_LIMIT } from 'tls';

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

    public getRecommendation(req: restify.Request, res: restify.Response, next: restify.Next) {
        // Recettes <- Ingrédients liké
        // match (u:User {name: "alain"})-[l:LIKE]->(i:Ingredient)<-[h:HAS]-(r:Recipe) return r, count(r.name)

        // Recettes <- Recettes publiées par les user followed (n niveau)
        // match (u:User {name: "alain"})-[f:FOLLOW*1..3]->(ou:User)-[:PUBLISH]->(r:Recipe) with r, LENGTH(f) as d return r,d
        let user = req.headers.authorization;

     //   Exemple exclusion
     //   MATCH (excluded:Ingredient)
     //   WHERE excluded.name in $excludedIngredients
     //   WITH collect(excluded) as excluded

     //   MATCH (r:Recipe)-[:INCLUDES]->(i)
     //   WITH excluded, r, collect(i) as ingredients
     //   WHERE NONE (i in ingredients where i in excluded)
     //   RETURN r

        let likedQuery: string = 'MATCH (u:User {email: $userEmailFrom})-[l:LIKE]->(r:Recipe)' +
            ' WITH collect(r) as likedRecipes';

        let substractQuery: string = ' WHERE NONE (r in recipes where r in likedRecipes)' +
            ' UNWIND recipes AS rec';

        let query: string = likedQuery +
            ' MATCH (u:User {email: $userEmailFrom})-[f:FOLLOW*1..2]->(ou:User)-[p:PUBLISH]->(r:Recipe)' +
            ' WITH likedRecipes, collect(r) as recipes, length(f) as depth' +
            substractQuery +
            ' RETURN rec, depth';

        let query2: string = likedQuery +
            ' MATCH (u:User {email: $userEmailFrom})-[l:LIKE]->(i:Ingredient)<-[h:HAS]-(r:Recipe)' +
            ' WITH likedRecipes, collect(r) as recipes, count(r.name) as count' +
            substractQuery +
            ' RETURN rec, count';

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
                        temp.rank *= 2 * cbf.depth.low;
                        tempResult.set(cbf.rec.identity.low, temp);
                    } else {
                        tempResult.set(cbf.rec.identity.low, { 'rank': cbf.depth.low * 0.5, 'recipe': cbf.rec });
                    }
                });

                tempResult.forEach((v, k) => {
                    
                    finalResult.push({
                        'recipe_id': k,
                        'rank': v.rank
                    })
                });

                res.json(200, finalResult);
            }, { 'userEmailFrom': user });

        }, { 'userEmailFrom': user })
    }
}