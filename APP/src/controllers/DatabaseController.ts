import * as Neo4J from "neo4j-driver";
import { config } from '../config/Config';
import { triggerAsyncId } from "async_hooks";
import * as restify from 'restify';
import { driver, Record } from "neo4j-driver/types/v1";

export class DatabaseController {

    private static _instance: DatabaseController = new DatabaseController();

    // Single driver for this application
    private driver = Neo4J.v1.driver(config.neo_url, Neo4J.v1.auth.basic(config.neo_user, config.neo_pass!));

    constructor() {
        if (DatabaseController._instance) {
            throw new Error("Error: Instantiation failed: Use DatabaseController.getInstance() instead of new.")
        }
        DatabaseController._instance = this;
    }

    /**
     * Return the singleton instance of DatabaseController
     */
    public static getInstance(): DatabaseController {
        return DatabaseController._instance;
    }

    /**
     * Make a generic cipher
     * @param query The cipher query you want to apply
     * @param return_element The element after the RETURN in the query
     * @param cb The callback which apply after success or error of this function
     * @param params Params to add to the query. Optional
     */
    public makeCipherQuery(query: string, return_element: string, cb: (resultRecords: Array<any>) => void, params?: any): void {
        // Obtain the session
        console.log("Session open");
        console.log(`Run Query : ${query}`);
        let session = this.driver.session();

        session.run(query, params).then(res => {

            var resultsObject: Array<any> = [];
            res.records.forEach(record => {
                resultsObject.push(record.get(return_element));
            });

            // Close the session
            session.close();
            console.log("Session close");

            // Callback with the array of type
            cb(resultsObject);
        }).catch(e => {
            console.log(e);
            cb(e);
        });
    }

    public getAll(type: string, cb: (allRec: Array<any>) => void) {
        // Obtain the session
        console.log(`Run Query : MATCH (t:${type}) RETURN t`);
        let session = this.driver.session();
        console.log("Session open");

        session.run(`MATCH (t:${type}) RETURN t`, {}).then(res => {

            var resultsObject: Array<any> = [];
            res.records.forEach(record => {
                resultsObject.push(record.get('t').properties);
            });

            // Close the session
            session.close();
            console.log("Session close");

            // Callback with the array of type
            cb(resultsObject);
        });
    }

    public saveReceipe(objectToSave: any, cb: (result: any, error: string) => void) {

        let session = this.driver.session();

        const writeTx = session.writeTransaction(tx => {
            const receipe_params = {
                name: objectToSave.name,
                preparation: objectToSave.preparation,
                cuisson: objectToSave.cuisson
            };

            tx.run('CREATE (r:Receipe {name:$name, preparation:$preparation, cuisson:$cuisson})', receipe_params);
        }).then(() => {
            session.close();
            cb({ status: 'ok' }, "");
        });
    }

    // A supprimer
    public saveUser(objectToSave: any, cb: (result: any, error: string) => void) {

        let session = this.driver.session();

        const writeTx = session.writeTransaction(tx => {
            const user_params = {
                name: objectToSave.username,
                email: objectToSave.email,
                password: objectToSave.password
            };
            tx.run('CREATE (r:User {name:$name, email:$email, password:$password})', user_params);
        }).then(() => {
            session.close();
            cb({ 'email': objectToSave.email, status: 'ok' }, "");
        }).catch(() => {
        });
    }

}
