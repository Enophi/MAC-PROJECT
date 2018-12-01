import IConfig from './IConfig'

// Get the ENV from exec machine
let env = process.env.NODE_ENV || 'development';

export let config: IConfig = {
    name: 'recipe-made-simple',
    version: '1.0.0',
    port: 3000,
    env: 'dev'
};

// Change la config si le serveur et en production
if (env === 'production') {
    config.env = 'prod';
}