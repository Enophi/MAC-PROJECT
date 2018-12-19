import IConfig from './IConfig';
import {neo_pass} from './LocalConfig'

// Get the ENV from exec machine
let env = process.env.NODE_ENV || 'development';

export let config: IConfig = {
    name: 'recipe-made-simple',
    version: '1.0.0',
    port: 6666,
    env: 'dev',
    neo_url: 'bolt://localhost:7687',
    neo_user: 'neo4j',
    neo_pass: neo_pass
};

// Change the env if the server is in production mode
if (env === 'production') {
    config.env = 'prod';
}