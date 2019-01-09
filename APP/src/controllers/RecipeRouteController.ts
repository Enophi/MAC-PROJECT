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
      // TODO Schema Validation of the INPUT

      //create ingredients
      //create recipe
      //create relations

      DatabaseController.getInstance().saveReceipe(req.body, (result, error) => {
          if(error)
              res.json(500, error);
          else
              res.json(200, result);
      });
  }

}
