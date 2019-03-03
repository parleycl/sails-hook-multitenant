var schemas = require('./methods/getschemas');
var multitenant = require('./methods/multitenant');
var addDatasource = require('./methods/adddatasource');
var d = require('./methods/datasource');
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

==========================================================`);
    sails.on('hook:orm:loaded', async function() {
        var SchemaMap = await schemas(sails);
        // Check if the multitenancy configuration function exists in the sails configuration object
        if(typeof sails.config.multitenancy !== 'function') {
            console.log(`
==============================================================================

The Multitenancy ORM Hook need the multitenancy configuration function in order 
to make a multitenancy calls to database based on request object.

================================================================================

Warning: Cannot locate the multitenancy selector function into Sails configuration folder.
If you use the Request Object way, please define a multitenancy function in a configuration sails file located in the config folder

================================================================================`)
        };
        // Alter the schemas to add Multitenancy properties

        for (let key in sails.hooks.orm.models) {
            let Model = sails.hooks.orm.models[key];
            // Add the tenancy function to make posible the multitenancy select
            Model.tenancy = async function(req, ignore_tenancy, ParentModel) {
                const _self = this;
                // If you provide a Parent Model and its a multitenant like the
                // the child model, this replies the multitenant information
                if (ParentModel && 
                    (ParentModel.multitenant && Model.multitenant)) {
                        _self.datastore = ParentModel.datastore;
                        return _self;
                }
                // If the model not have a multitenant return self;
                if(ignore_tenancy || !Model.multitenant) return _self;
                // If diferent go to search the multitentant;
                return await multitenant(req, Model, _self, sails, SchemaMap);
            }
            // Add the function to add new datasource
            Model.addDatasource = async function(identity, config){
                const _self = this;
                if(config.constructor.name === 'DataStoreConfig'){
                    return await addDatasource(Model, _self, sails, SchemaMap, config, identity);
                }
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