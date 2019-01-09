import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class UserRouteController {

    public saveUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        console.log(req.body);
        // TODO Schema Validation of the INPUT

        DatabaseController.getInstance().saveUser(req.body, (result, error) => {
            if (error)
                res.json(500, error);
            else
                res.json(200, result);
        });
    }

    public loginUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        console.log(req.body);
        // TODO Schema Validation of the INPUT

        DatabaseController.getInstance().makeCipherQuery("MATCH (u:User {email: $email, password: $password}) return u", "u", login => {

            if (login.length == 0) res.json(401, { 'email': req.body.email, 'status': 'nok' })
            else res.json(200, { 'email': req.body.email, 'status': 'ok' })

        }, { 'email': req.body.email, 'password': req.body.password });
    }
}
