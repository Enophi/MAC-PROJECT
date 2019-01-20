import * as restify from 'restify';
import { DatabaseController } from "./DatabaseController";

export default class UserRouteController {

    public saveUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        let userEmail: string = req.body.email;
        let userName: string = req.body.username;
        let userPassword: string = req.body.password;

        //check if user exist
        let queryCheckUser: string = 'MATCH (u:User)'
            + 'WHERE  u.email = $email'
            + ' RETURN u';

        DatabaseController.getInstance().makeCipherQuery(queryCheckUser, 'u', result => {
            if (result.length == 0) {
                let querySaveUser: string = 'CREATE (r:User {name:$name, email:$email, password:$password}) return r';
                DatabaseController.getInstance().makeCipherQuery(querySaveUser, 'r', register => {
                    if (register.length == 0) res.json(401, { 'email': req.body.email, 'status': 'nok' })
                    else res.json(200, { 'email': req.body.email, 'status': 'ok' })
                }, { 'name': userName, 'email': userEmail, 'password': userPassword })
            } else {
                res.json(401, { 'status': 'nok' })
            }
        }, { 'email': userEmail });
    }

    public loginUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        console.log(req.body);
        // TODO Schema Validation of the INPUT

        DatabaseController.getInstance().makeCipherQuery("MATCH (u:User {email: $email, password: $password}) return u", "u", login => {

            if (login.length == 0) res.json(401, { 'email': req.body.email, 'status': 'nok' })
            else res.json(200, { 'email': req.body.email, 'status': 'ok' })

        }, { 'email': req.body.email, 'password': req.body.password });
    }

    public followUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: any = req.headers.authorization;
        let userToFollow: string = req.params.email;

        console.log(req.body);
        console.log(user);
        console.log(userToFollow);


        let queryRel: string = "MATCH (u:User),(utf:User)"
            + " WHERE u.email = $user AND utf.email = $userToFollow"
            + " MERGE (u)-[rel:FOLLOW]->(utf)"
            + " RETURN rel";


        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
            if (result.length == 0) res.json(401, { 'status': 'nok' })
            else res.json(200, 1)
        }, { 'user': user, 'userToFollow': userToFollow });
    }

    public  unfallowUser(req: restify.Request, res: restify.Response, next: restify.Next) {
        let user: any = req.headers.authorization;
        let userToUnfollow: string = req.params.email;

        console.log(user);
        console.log(userToUnfollow);

        let queryRel: string = "MATCH (u:User),(utuf:User)"
            + " WHERE u.email = $user AND utuf.email = $userToUnfollow"
            + " MATCH (u)-[rel:FOLLOW]->(utuf)"
            + " DELETE rel"
            + " RETURN rel";

        DatabaseController.getInstance().makeCipherQuery(queryRel, 'rel', result => {
            if (result.length == 0) res.json(401, { 'status': 'nok' });
            else res.json(200, 1);
        }, { 'user': user, 'userToUnfollow': userToUnfollow });
    }
}
