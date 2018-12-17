import * as restify from 'restify';
import {DatabaseController} from "./DatabaseController";

export default class UserRouteController {

    public getAll(req: restify.Request, res: restify.Response, next: restify.Next) {
        return DatabaseController.getInstance().getAll(req, res, next, 'User')
    }

    public getOne(req: restify.Request, res: restify.Response, next: restify.Next) {
        return DatabaseController.getInstance().getOne(req, res, next, 'User')
    }

}
