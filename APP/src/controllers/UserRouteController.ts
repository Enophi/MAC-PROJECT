import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class UserRouteController {

    public saveUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        console.log(req.body);
        // TODO Schema Validation of the INPUT

        DatabaseController.getInstance().saveUser(req.body, (result, error) => {
            if(error)
                res.json(500, error);
            else
                res.json(200, result);
        });
    }

    public loginUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        console.log(req.body);
        // TODO Schema Validation of the INPUT

        DatabaseController.getInstance().loginUser(req.body, (result, error) => {
            if(error)
                res.json(500, error);
            else
                res.json(200, result);
        });
    }
}
