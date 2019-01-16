import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class RecipeRouteController {

  public getAllRecipes(req: restify.Request, res: restify.Response, next: restify.Next) {
      let query: string = "MATCH r=()-->() RETURN r" // LIMIT 25 ?
      DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {
          res.json(200, result);
      });
  }

  public getRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
      let query: string = 'MATCH m = (r:Recipe)--() WHERE  ID(r) = toInteger($id) RETURN m';
      DatabaseController.getInstance().makeCipherQuery(query, 'm', result => {
          res.json(200, result);
      }, {'id': req.params.id});
  }

  public deleteRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
    //drop p and p's relations
    let query: string = 'MATCH (p:Recipe) WHERE ID(p) = toInteger($id)'
                       +'OPTIONAL MATCH (p)-[r]-() DELETE r,p';
    DatabaseController.getInstance().makeCipherQuery(query, 'm', result => {
        res.json(200, 1);
    }, {'id': req.params.id});
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
      let query:string = "CREATE (r:Recipe {name: $name, preparation: $preparation}) RETURN r"
      DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {

        ingredients.forEach(ing => {
          //check if ingredient exist
          let query:string = 'MATCH (i:Ingredient)'
                             + 'WHERE  i.name = $name'
                             + ' RETURN i';

          DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

            let queryRel:string = " MATCH (r:Recipe),(i:Ingredient) "
                                  +"WHERE r.name = $recipe  AND i.name = $ing "
                                  +"CREATE (r)-[rel:HAS {quantity: toInteger($quantity), unit: $unit}]->(i) "
                                  +"RETURN rel";
            let paramsRel = {'recipe': recipe.name, 'ing': ing.name, 'quantity': ing.quantity, 'unit': ing.unit};

            //create Ingredient and relation
            if(result.length == 0){
              DatabaseController.getInstance().makeCipherQuery("CREATE (i:Ingredient {name: $name }) RETURN i", 'i',
              result => {
                DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {}, paramsRel);
              }, {'name': ing.name} );

            }else{ //ingredients exist
              //create only rel
              DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {}, paramsRel);
            }
          }, {'name': ing.name});

        }); //end forEach

        //user relation
        let queryRel:string = "MATCH (r:Recipe),(u:User) "
                              +" WHERE r.name = $name  AND ID(u) = toInteger($user)"
                              + " CREATE (u)-[rel:PUBLISH]->(r) "
                              +"RETURN rel";

        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
          res.json(200, 1);
        }, {'name': recipe.name, 'user': user});

      }, { 'name': recipe.name, 'preparation':recipe.preparation });
  }


  private addIngredientWithRelation(ing:any, recipe:string){

  }

}
