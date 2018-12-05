import IConfig from './IConfig'

// Get the ENV from exec machine
let env = process.env.NODE_ENV || 'development';

export let config: IConfig = {
    name: 'recipe-made-simple',
    version: '1.0.0',
    port: 3000,
    env: 'dev',
    neo_url: 'bolt://neo4j',
    neo_user: 'neo4j',
    neo_pass: 'test'
};

// Change the env if the server is in production mode
if (env === 'production') {
    config.env = 'prod';
}