var schemas = require('./methods/getschemas');
var multitenant = require('./methods/multitenant');
var actions = require('./internal/methods');

module.exports = function inicialize(sails, cb) {
    console.log
    (`
==========================================================
 _____   _____   _   _     _____     __  __   _____
|  ___| |  _  | | | | |   |  ___|   |  \\/  | |_   _|
| |___  | |_| | | | | |   | |___    |      |   | |
|____ | |  _  | | | | |   |____ |   | |\\/| |   | |
 ___| | | | | | | | | |__  ___| |   | |  | |   | |
|_____| |_| |_| |_| |____||_____|   |_|  |_|   |_|

Waterline Multitenant ORM Project
License: MIT
Git: https://www.github.com/acalvoa/sails-hook-multitenant
Made with ❤ in Chile by Rockstart

==========================================================`);
    sails.on('hook:orm:loaded', async function() {
        var SchemaMap = await schemas(sails);
        // Check if the multitenancy configuration function exists in the sails configuration object
        if(typeof sails.config.multitenancy !== 'function') {
            console.log(`
==============================================================================

The Multitenancy ORM Hook need the multitenancy configuration function in order 
to make a multitenancy calls to database.

================================================================================

Please define a multitenancy function in a configuration sails file located in the config folder
Error 01: Cannot locate the multitenancy selector function

================================================================================`)
        };
        // Alter the schemas to add Multitenancy properties
        for (key in sails.hooks.orm.models) {
            var Model = sails.hooks.orm.models[key];
            // Add the tenancy function to make posible the multitenancy select
            Model.tenancy = async function(req) {
                const _self = this;
                return await multitenant(req, Model, _self, sails, SchemaMap);
            }
            // Store the original datastore to use in normal calls to database
            Model.s_datastore = Model.datastore;
            // Modify all model functions to add the multitenancy properties
            for(let key in actions) {
                let action = Model[key];
                Model['s_'+key] = action;
                Model[key] = actions[key];
            }
        }
    })
    // Do some stuff here to initialize hooks
    // And then call `cb` to continue
    return cb();
}