import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

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
        let recipes:Array<any> = [];
        result.forEach(r => {
          var recipe = {name:'',preparation:'',ingredients:[]};

          recipe.name = r.start.properties.name;
          recipe.preparation = r.start.properties.preparation;

          //todo add ingredients and update query
          recipes.push(recipe);
        });
          res.json(200, result);
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
      res.json(200, result);
    }, { 'id': req.params.id });
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
    console.log(req.body);

    let recipe: any = req.body.recipe;
    let ingredients: Array<any> = req.body.ingredients;
    let user: any = req.headers.authorization;

    //requiered input
    if (user == null || recipe == null || recipe.name == null) {
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
        + "WHERE r.name = $name  AND u.mail = $user "
        + "MERGE (u)-[rel:PUBLISH]->(r) "
        + "RETURN rel";

      DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {

        res.json(200, 1);
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

    let query = 'MATCH (r:Recipe) -- (u:User {mail : $user}) ' +
      'WHERE ID(r) = toInteger($id) ' +
      'RETURN r';

    DatabaseController.getInstance().makeCipherQuery(query, 'r', result => {
      if(result.length != 0){
        cb();
      }else{ //error
        res.json(403, {"error": "user not authorized"});
      }
    }, { 'user': user, 'id': id });
  }

    /**
     * Like a recipe
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
     */
  public liked(req: restify.Request, res: restify.Response, next: restify.Next) {
    let user: any = req.headers.authorization;
    let recipe: number = req.params.id;

    let queryRel: string = "MATCH (u:User),(r:Recipe)"
      + " WHERE u.email = $user AND ID(r) = toInteger($id)"
      + " MERGE (u)-[rel:LIKE]->(r)"
      + " RETURN rel";

    DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
      if (result.length == 0) res.json(401, {'status': 'nok' });
      else res.json(200, 1);
    }, {'user':user, 'id':recipe});
  }

    /**
     * Unlike a recipe
     * @param req The request parameter
     * @param res result parameter
     * @param next next restify
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
      if (result.length == 0) res.json(401, {'status': 'nok' });
      else res.json(200, 1);
    }, {'user':user, 'id':recipe});
  }
}
