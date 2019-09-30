var datasources = require('./getdatasources');
var createDatasource = require('./createdatasource');
var d = require('./datasource');

module.exports = function multitenant(req, model, self, sails, schema, WLModel) {
    const _self = self;
    return new Promise(async (resolve,reject) => {
        // Check the type of call used for multitenant
        if (req && req.constructor.name === 'IncomingMessage') {
            if(typeof sails.config.multitenancy !== 'function') {
                throw new Error('The multitenancy configuration function is not defined. Please define a configuration option to use the Request Object Way.');
            }
            const config = await sails.config.multitenancy(req);
            const _datasource = datasources(model);
            if(_datasource.search(config.identity)) {
                _self.datastore = config.identity;
                resolve(_self);
            } else {
                if(d.isDatasource(config) && config.identity) {
                    var _newdatasource = new d.datasource(config.host, config.port, config.schema, config.adapter, config.user, config.password, config.database);
                    await createDatasource(model, _newdatasource, config.identity, schema, function(){
                        _self.datastore = config.identity;
                        resolve(_self);
                    });
                } else {
                    throw new Error('The return of multitenancy configuration function is not adaptable to Datasource Object. Please check the properties of Datasource object in the configuration function');
                }
            }
        } else if (req && req.constructor.name === 'DataStoreConfig') {
            const hash = Buffer.from(JSON.stringify(req)).toString('base64');
            const _datasource = datasources(model);
            if(_datasource.search(hash)) { 
                _self.datastore = hash;
                resolve(_self);
            } else {
                const _datasource = await createDatasource(model, req, hash, schema, function(){
                    _self.datastore = hash;
                    resolve(_self);
                });
            }
            
        } else if (req && typeof req === 'string') {
            const _datasource = datasources(model);
            const m64identity = Buffer.from(req).toString('base64');
            if(_datasource.search("Mt_" + m64identity + "_" + req)) {
                _self.datastore = "Mt_" + m64identity + "_" + req;
                resolve(_self);
            } else {
                throw new Error('The datasource ' + req + 'was not created. Please create the datasource to use with the name.');
            }
        } else {
            _self.datastore = _self.s_datastore;
            resolve(_self);
        }
    });  
}