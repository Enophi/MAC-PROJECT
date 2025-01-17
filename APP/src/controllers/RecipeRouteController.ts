import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";
import pino from 'pino';

// LOGGER
const L = pino();

export default class RecipeRouteController {

  private static _instance: RecipeRouteController = new RecipeRouteController();

  /**
   * constructor
   */
  constructor() {
    if (RecipeRouteController._instance) {
      throw new Error("Error: Instantiation failed: Use RecipeRouteController.getInstance() instead of new.")
    }
    RecipeRouteController._instance = this;
  }

  /**
   * Return the singleton instance of RecipeRouteController
   */
  public static getInstance(): RecipeRouteController {
    return RecipeRouteController._instance;
  }

  /**
   * Update all recipes
   * @param req The request parameter
   * @param res result parameter
   * @param next next restify
   */
  public getAllRecipes(req: restify.Request, res: restify.Response, next: restify.Next) {
    let query: string = "MATCH r=(:Recipe)-->() RETURN r"
    DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {

      let recipes: Array<any> = [];

      result.forEach(r => {
        let ingredient = RecipeRouteController.getInstance().getIngredientFrom(r);

        //recipe info
        let rid = r.start.identity.low;
        let rname = r.start.properties.name;
        let preparation = r.start.properties.preparation;

        var exist = false;
        recipes.forEach(current => {
          if (current.id == rid) {
            exist = true;
            //add ingredient to current recipe
            current.ingredients.push(ingredient);
          }
        });

        //if recipe doesn't exist in collection
        if (!exist) {
          let recipe = {
            'id': rid,
            'name': rname,
            'preparation': preparation,
            'ingredients': [ingredient]
          };

          recipes.push(JSON.parse(JSON.stringify(recipe))); //fix circular object problem
        }
      });
      res.json(200, recipes);
    });
  }

  /**
   * get a recipe
   * @param req The request parameter
   * @param res result parameter
   * @param next next restify
   */
  public getRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
    let query: string = 'MATCH m = (r:Recipe)--() WHERE  ID(r) = toInteger($id) RETURN m';
    DatabaseController.getInstance().makeCipherQuery(query, 'm', result => {

      let rid = result[0].start.identity.low;
      let rname = result[0].start.properties.name;
      let preparation = result[0].start.properties.preparation;
      let ingredients: Array<any> = [];
      let owner = { 'firstname': '', 'lastname': '', 'email': '' };

      result.forEach(r => {
        let type = r.end.labels[0];
        if (type == 'Ingredient') {
          ingredients.push(RecipeRouteController.getInstance().getIngredientFrom(r));
        } else if (type == 'User') {
          let user = r.end.properties;
          owner.firstname = user.firstname;
          owner.lastname = user.lastname;
          owner.email = user.email;
        }
      });

      let recipe = {
        'id': rid,
        'name': rname,
        'preparation': preparation,
        'ingredients': ingredients,
        'owner': owner
      };
      res.json(200, recipe);
    }, { 'id': req.params.id });
  }

  /**
  * Used by getRecipe and getAllRecipes
  * @param r Any object from Cypher query
  */
  private getIngredientFrom(r: any): any {
    let iid = r.end.identity.low;
    let iname = r.end.properties.name;
    let unit = r.segments[0].relationship.properties.unit;
    let quantity = r.segments[0].relationship.properties.quantity.low;
    return { 'id': iid, 'name': iname, 'unit': unit, 'quantity': quantity };
  }

  /**
   * Delete a recipe
   * @param req The request parameter
   * @param res result parameter
   * @param next next restify
   */
  public deleteRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
    let id: string = req.params.id;
    let user: any = req.headers.authorization;

    RecipeRouteController.getInstance().userIsOwner(res, user, id, () => {
      RecipeRouteController.getInstance().doDelete(id, () => {
        res.json(200, 1);
      });
    });
  }

  /**
   * Update a recipe
   * @param req The request parameter
   * @param res result parameter
   * @param next next restify
   */
  public updateRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {
    let id: string = req.params.id;
    let user: any = req.headers.authorization;

    RecipeRouteController.getInstance().userIsOwner(res, user, id, () => {
      //delete recipe
      RecipeRouteController.getInstance().doDelete(id, () => { });
      //and re-create with new ingredients
      RecipeRouteController.getInstance().addRecipe(req, res, next);
    });
  }

  /**
   * addRecipe
   * @param req The request parameter
   * @param res result parameter
   * @param next next restify
   */
  public addRecipe(req: restify.Request, res: restify.Response, next: restify.Next) {

    let recipe: any = req.body.recipe;
    let ingredients: Array<any> = req.body.ingredients;
    let user: any = req.headers.authorization;

    //requiered input
    if (user == undefined || recipe == undefined || recipe.name == undefined) {
      res.json(500, { "error": "Invalid JSON" });
    }

    //create recipe
    let query: string = "CREATE (r:Recipe {name: $name, preparation: $preparation}) RETURN r"
    DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {

      ingredients.forEach(ing => {
        RecipeRouteController.getInstance().addIngredientWithRelation(ing, recipe.name);
      });

      //user relation
      let queryRel: string = "MATCH (r:Recipe),(u:User) "
        + "WHERE r.name = $name  AND u.email = $user "
        + "MERGE (u)-[rel:PUBLISH]->(r) "
        + "RETURN rel";

      DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', releationResult => {

        res.json(200, result);
      }, { 'name': recipe.name, 'user': user });

    }, { 'name': recipe.name, 'preparation': recipe.preparation });
  }

  /**
   * delete a recipe by id
   * @param id The id of recipe
   * @param cb callback
   */
  private doDelete(id: string, cb: () => void) {
    //drop p and p's relations
    let deleteQuery: string = 'MATCH (p:Recipe) WHERE ID(p) = toInteger($id) '
      + 'OPTIONAL MATCH (p)-[r]-() DELETE r,p';
    DatabaseController.getInstance().makeCipherQuery(deleteQuery, 'm', result => {
      cb();
    }, { 'id': id });
  }

  /**
   * Add Ingredient with relation recipe
   * @param ing Ingredient object
   * @param recipe Recipe's name
   */
  private addIngredientWithRelation(ing: any, recipe: string) {
    //check if ingredient exist
    let query: string = 'MATCH (i:Ingredient)'
      + 'WHERE  i.name = $name'
      + ' RETURN i';

    DatabaseController.getInstance().makeCipherQuery(query, 'i', result => {

      let queryRel: string = " MATCH (r:Recipe),(i:Ingredient) "
        + "WHERE r.name = $recipe  AND i.name = $ing "
        + "MERGE (r)-[rel:HAS {quantity: toInteger($quantity), unit: $unit}]->(i) "
        + "RETURN rel";
      let paramsRel = { 'recipe': recipe, 'ing': ing.name, 'quantity': ing.quantity, 'unit': ing.unit };

      //create Ingredient and relation
      if (result.length == 0) {
        DatabaseController.getInstance().makeCipherQuery("CREATE (i:Ingredient {name: $name }) RETURN i", 'i',
          result => {
            DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => { }, paramsRel);
          }, { 'name': ing.name });

      } else { //ingredients exist
        //create only rel
        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => { }, paramsRel);
      }
    }, { 'name': ing.name });
  }

  /**
   * Verify if user is the owner of recipe
   * @param res result parameter
   * @param user The user
   * @param id The id's recipe
   * @param cb Callback, called if user is authorized
   */
  private userIsOwner(res: restify.Response, user: any, id: string, cb: () => void) {

    let query = 'MATCH (r:Recipe) -- (u:User {email : $user}) ' +
      'WHERE ID(r) = toInteger($id) ' +
      'RETURN r';

    DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {
      if (result.length != 0) {
        cb();
      } else { //error
        res.json(403, { "error": "user not authorized" });
      }
    }, { 'user': user, 'id': id });
  }

  /**
   * user like a recipe
   * @param req
   * @param res
   * @param next
   */
  public liked(req: restify.Request, res: restify.Response, next: restify.Next) {
    let user: any = req.headers.authorization;
    let recipe: number = req.params.id;

    let queryRel: string = "MATCH (u:User),(r:Recipe)"
      + " WHERE u.email = $user AND ID(r) = toInteger($id)"
      + " MERGE (u)-[rel:LIKE]->(r)"
      + " RETURN rel";

    DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
      if (result.length == 0) res.json(401, { 'status': 'nok' });
      else res.json(200, 1);
    }, { 'user': user, 'id': recipe });
  }

  /**
   * user unlike a recipe
   * @param req
   * @param res
   * @param next
   */
  public unliked(req: restify.Request, res: restify.Response, next: restify.Next) {
    let user: any = req.headers.authorization;
    let recipe: number = req.params.id;

    let queryRel: string = "MATCH (u:User),(r:Recipe)"
      + " WHERE u.email = $user AND ID(r) = toInteger($id)"
      + " MATCH (u)-[rel:LIKE]->(r)"
      + " DELETE rel"
      + " RETURN rel";

    DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
      if (result.length == 0) res.json(401, { 'status': 'nok' });
      else res.json(200, 1);
    }, { 'user': user, 'id': recipe });
  }
}
