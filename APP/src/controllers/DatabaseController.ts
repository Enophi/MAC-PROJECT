import Neode from 'neode';
import * as restify from 'restify';
import {config} from '../config/Config'

export class DatabaseController {

    private static _instance: DatabaseController = new DatabaseController();

    public neo = new Neode(config.neo_url, config.neo_user, config.neo_pass!);

    constructor() {
        if (DatabaseController._instance) {
            throw new Error("Error: Instantiation failed: Use DatabaseController.getInstance() instead of new.")
        }
        DatabaseController._instance = this;
        this.loadModels();
    }

    /**
     * Return the singleton instance of DatabaseController
     */
    public static getInstance(): DatabaseController {
        return DatabaseController._instance;
    }

    /*
      Return all for a model
    */
    public getAll(req: restify.Request, res: restify.Response, next: restify.Next, type:string){
      return DatabaseController.getInstance().neo.all(type).then(collection => {
        console.log(collection.toJson());
          return collection.toJson();
      }).then(json => {
          console.log(json)
          res.json(200, json);
          next();
      }).catch((e) => {
          console.log("ERROR: " + e);
          res.send(500, {error:e})
          next(false);
      });
    }

    /**
     * Load the entities schema
     */
    private loadModels(): void {
        this.neo.with({
            Recipe: require('../models/Recipe'),
            Ingredient: require('../models/Ingredient'),
            User: require('../models/User')
        });

        console.log("Model load");
    }

}
