console.log('DEBUG JS START');
require('dotenv').config();
console.log('DOTENV LOADED');
const { MikroORM } = require('@mikro-orm/core');
console.log('MIKROORM IMPORTED');

const run = async () => {
    try {
        console.log('CONNECTING...');
        // Minimal connection without entities first
        // Just to see if driver loads
        const driver = require('@mikro-orm/postgresql').PostgreSqlDriver;
        console.log('DRIVER LOADED');

        // Attempt init with empty entities for now (might fail but should log)
        const orm = await MikroORM.init({
            clientUrl: process.env.DATABASE_URL,
            entities: [],
            driver: driver,
            debug: true
        });
        console.log('CONNECTED');
        await orm.close();
    } catch (e) {
        console.error('ERROR:', e);
    }
};

run();
