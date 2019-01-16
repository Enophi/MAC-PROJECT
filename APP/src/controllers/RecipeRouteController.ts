import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class RecipeRouteController {

  public getAllRecipes(req: restify.Request, res: restify.Response, next: restify.Next) {

      let query: string = "MATCH r=()-->() RETURN r LIMIT 25"
      DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {

          // TODO Do something with result, map with real Object, clean it, whatever...

          res.json(200, result);
      });
  }

  public getRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {

      let id:string = req.params.id;

      let query: string = 'MATCH m = (r:Recipe)--() WHERE  ID(r) = '+ id +' RETURN m';

      DatabaseController.getInstance().makeCipherQuery(query, 'm', result => {
          // TODO Do something with result, map with real Object, clean it, whatever...
          res.json(200, result);
      });
  }

    /*public getAllRecipes2(req: restify.Request, res: restify.Response, next: restify.Next) {
        DatabaseController.getInstance().getAll("Recipe", result => {

            // TODO Do something with result, map with real Object, clean it, whatever...

            res.json(200, result);
        });
    }*/

  public deleteRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
    let id:string = req.params.id;

    //drop p and p's relations
    let query: string = 'MATCH (p:Recipe) WHERE ID(p) = '+ id +' OPTIONAL MATCH (p)-[r]-() DELETE r,p';

    DatabaseController.getInstance().makeCipherQuery(query, 'm', result => {
        // TODO Do something with result, map with real Object, clean it, whatever...
        res.json(200, result);
    });
  }

  public updateRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {

      let id:string = req.params.id;

      let query: string = ''; // TODO

      DatabaseController.getInstance().makeCipherQuery(query, 'm', result => {
          // TODO Do something with result, map with real Object, clean it, whatever...
          res.json(200, result);
      });

  }

  public addRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
      console.log(req.body);

      /* Example
      {
        "recipe":{
          "name":"Tarte au framboise",
          "preparation":"30"
        },
        "ingredients":[
          {"name":"framboise", "quantity":"10", "unit":"pce"},
          {"name":"sucre","quantity":"10", "unit":"scoop"}
        ],
        "user":61
      }
      */

      let recipe:any = req.body.recipe;
      let ingredients:Array<any> = req.body.ingredients;
      let user:String = req.body.user;

      //requiered input
      if(user == null || recipe == null || recipe.name == null){
        res.json(500, {"error": "Invalid JSON"});
      }

      //create recipe
      let query:string = "CREATE (r:Recipe {name: '"+ recipe.name +"', preparation: "+ recipe.preparation +"}) RETURN r"
      DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {
        //user relation
        let queryRel:string = "MATCH (r:Recipe),(u:User) "
                              +" WHERE r.name = '"+ recipe.name +"'  AND ID(u) = " + user
                              + " CREATE (u)-[rel:PUBLISH]->(r) "
                              +"RETURN rel";


        ingredients.forEach(ing => {
          //check if ingredient exist
          let query:string = 'MATCH (i:Ingredient)'
                             + 'WHERE  i.name = "'+ ing.name
                             + '" RETURN i';

          DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

            let queryRel:string = "MATCH (r:Recipe),(i:Ingredient) "
                                  +" WHERE r.name = '"+ recipe.name +"'  AND i.name = '" + ing.name
                                  + "' CREATE (r)-[rel:HAS {quantity: " + ing.quantity + ", unit:'"+ ing.unit +"'}]->(i) "
                                  +"RETURN rel";

            //create Ingredient and relation
            if(result.length == 0){
              let queryInsert:string = "CREATE (i:Ingredient {name:'"+ ing.name +"'}) RETURN i";
              DatabaseController.getInstance().makeCipherQuery(queryInsert, 'i', result => {
                DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {});
              });

            }else{ //ingredients exist
              //create rel
              DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {});
            }
          });
        });

        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
          res.json(200, 1);
        });
      });
  }


/*  private addIngredientWithRelation(ing:any, recipe:string){

}*/

}
