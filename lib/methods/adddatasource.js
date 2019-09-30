var datasources = require('./getdatasources');
var d = require('./datasource');

module.exports = function(Model, _self, sails, SchemaMap, config, identity) {
    return new Promise(async (resolve,reject) => {
        // Method to create a datasource in all models
        const d_config = new d.datasource(config.host, config.port, config.schema, config.adapter, config.user, config.password, config.database);
        d_config.identity = "Mt_" + Buffer.from(identity).toString('base64') + "_" + identity;
        // Iterate all models
        models_count = Object.keys(sails.hooks.orm.models).length;
        models_process = 0;
        for (key in sails.hooks.orm.models) {
            const model = sails.hooks.orm.models[key];
            const _datasources = datasources(model);
            // Create the datasource only if not exists
            if(!_datasources.search(d_config.identity)) {
                model._adapter.registerDatastore(d_config, SchemaMap, function(){
                    console.log("Datasource " + d_config.identity + " registered.");
                    if(++models_process == models_count) resolve(_self);
                });
            } else {
                if(++models_process == models_count) resolve(_self);
            }
        }
    })
}