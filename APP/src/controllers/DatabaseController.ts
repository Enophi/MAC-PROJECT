import Neode from 'neode';
import {config} from '../config/Config'

export class DatabaseController {

    private static _instance: DatabaseController = new DatabaseController();

    public neo = new Neode(config.neo_url, config.neo_user, config.neo_pass);

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

    /**
     * Load the entities schema
     */
    private loadModels(): void {
        this.neo.with({
            Recipe: require('../models/Recipe'),
            Ingredient: require('../models/Ingredient')
        });
        console.log("Model load");
    }

}