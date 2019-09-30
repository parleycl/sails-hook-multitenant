var datasources = require('./getdatasources');
var d = require('./datasource');

module.exports = function(sails, SchemaMap, config, identity) {
    return new Promise(async (resolve,reject) => {
        // Method to create a datasource in all models
        const d_config = new d.datasource(config.host, config.port, config.schema, config.adapter, config.user, config.password, config.database);
        d_config.identity = "Mt_" + Buffer.from(identity).toString('base64') + "_" + identity;

        let adapter = sails.hooks.orm.adapters[config.adapter];
        const _datasources = datasources(null, true);

        if(!_datasources.search(d_config.identity)) {
            adapter.registerDatastore(d_config, SchemaMap, function(){
                console.log("Datasource " + identity + " registered.");
                resolve(_self);
            });
        } else {
            resolve(_self);
        }
    })
}