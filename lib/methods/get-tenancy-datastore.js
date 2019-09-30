var datasources = require("./getdatasources");
const loadAdapterFromAppDependencies = require('sails-hook-orm/lib/load-adapter-from-app-dependencies');
const validateAdapter = require('sails-hook-orm/lib/validate-adapter');
const createDatasourceFromAdapter = require('./create-datasource-from-adapter');

var d = require("./datasource");

module.exports = function getTenancyAdapter(req, datasource, sails) {
  const _self = this;
  const adapters = sails.hooks.orm.adapters;
  return new Promise(async (resolve, reject) => {
    // Check the type of call used for multitenant
    if (req && req.constructor.name === "IncomingMessage") {
      if (typeof sails.config.multitenancy !== "function") {
        throw new Error(
          "The multitenancy configuration function is not defined. Please define a configuration option to use the Request Object Way."
        );
      }
      
      const config = await sails.config.multitenancy(req);
      if (!config) {
        throw new Error(
          "The tenant selection is undefined, please check your tenancy selector function"
        );
      }
      if (!adapters[config.adapter]) {
        const newAdapter = loadAdapterFromAppDependencies(config.adapter, config.indentity, sails);
        if (!newAdapter) newAdapter = validateAdapter(config.adapter, config.indentity);
        if (!newAdapter) {
          throw new Error(
            "The adapter driver not exist or the custom adapter is not set"
          );
        }
        sails.hooks.orm.adapters[config.adapter] = newAdapter;
      }

      const _datasource = datasources(null, true);
      if (_datasource.search(config.identity)) {
        resolve(_datasource[config.identity]);
      } else {
        if (d.isDatasource(config) && config.identity) {
          const adapter = adapters[config.adapter];
          var _newdatasource = new d.datasource(config.host, config.port, 
            config.schema, config.adapter, config.user, config.password, 
          config.database);
          await createDatasourceFromAdapter(adapter, _newdatasource, config.identity, config.schema, function() {
            adapter.datastores[config.identity].name = config.identity;
            sails.hooks.orm.datastores[config.identity] = adapter.datastores[config.identity];
            resolve(adapter.datastores[config.identity]);
          });
        } else {
          throw new Error(
            "The return of multitenancy configuration function is not adaptable to Datasource Object. Please check the properties of Datasource object in the configuration function"
          );
        }
      }
    } else if (req && req.constructor.name === "DataStoreConfig") {
      const hash = Buffer.from(JSON.stringify(req)).toString("base64");
      const _datasource = datasources(null, true);
      if (_datasource.search(hash)) {
        resolve(_datasource[hash]);
      } else {
        await createDatasourceFromAdapter(adapter, req, hash, req.schema, function() {
          adapter.datastores[config.identity].name = hash;
          sails.hooks.orm.datastores[config.identity] = adapter.datastores[config.identity];
          resolve(adapter.datastores[config.identity]);
        });
      }
    } else if (req && typeof req === "string") {
      const _datasource = datasources(null, true);
      const m64identity = Buffer.from(req).toString("base64");
      if (_datasource.search("Mt_" + m64identity + "_"+ req)) {
        resolve(_datasource["Mt_" + m64identity + "_" + req]);
      } else {
        throw new Error(
          "The datasource " +
            req +
            "was not created. Please create the datasource to use with the name."
        );
      }
    } else {
      resolve(datasource);
    }
  });
};
