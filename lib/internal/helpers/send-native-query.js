var _ = require('@sailshq/lodash');
var parley = require('parley');
var flaverr = require('flaverr');
var _datasources = require('../../methods/getdatasources');
var helpSendNativeQuery = require('sails-hook-orm/lib/datastore-method-utils/help-send-native-query');
var adapterSupportVerify = require('../../methods/adapter-support-verify');

module.exports = function(req, _nativeQuery, _valuesToEscape, explicitCb, _meta, more) {

  // ███╗   ███╗██╗   ██╗██╗  ████████╗██╗████████╗███████╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗██╗   ██╗
  // ████╗ ████║██║   ██║██║  ╚══██╔══╝██║╚══██╔══╝██╔════╝████╗  ██║██╔══██╗████╗  ██║██╔════╝╚██╗ ██╔╝
  // ██╔████╔██║██║   ██║██║     ██║   ██║   ██║   █████╗  ██╔██╗ ██║███████║██╔██╗ ██║██║      ╚████╔╝ 
  // ██║╚██╔╝██║██║   ██║██║     ██║   ██║   ██║   ██╔══╝  ██║╚██╗██║██╔══██║██║╚██╗██║██║       ╚██╔╝  
  // ██║ ╚═╝ ██║╚██████╔╝███████╗██║   ██║   ██║   ███████╗██║ ╚████║██║  ██║██║ ╚████║╚██████╗   ██║   
  // ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝   

  const _self = this;
  _self.datastore = _self.s_datastore;
  var ignore_tenancy = true;
  // Get datasource
  const datasources = _datasources(null, true);
  // Define the args array to get the tenancy var
  var args = Array.from(arguments);
  // Tenancy req  argument analisis
  if ((typeof args[0] === 'string' && typeof args[1] === 'string') 
      || typeof args[0] === 'object') {
    if(typeof args[0] === 'string' && datasources.searchStringIdentity(args[0])) {
      ignore_tenancy = false;
    } else if (typeof args[0] === 'object' && (args[0].constructor.name === 'IncomingMessage' || args[0].constructor.name === 'DataStoreConfig')) {
      ignore_tenancy = false;
    } else {
      _nativeQuery = args[0];
      _valuesToEscape = args[1];
      explicitCb = args[2];
      _meta = args[3];
      more = args[4]
    }
  } else {
    _nativeQuery = args[0];
    _valuesToEscape = args[1];
    explicitCb = args[2];
    _meta = args[3];
    more = args[4]
  }

  // Handle variadic usage:
  // ```
  // sendNativeQuery('foo', function(){...})
  // ```

  if (arguments.length === 2 && _.isFunction(_valuesToEscape)) {
    explicitCb = _valuesToEscape;
    _valuesToEscape = undefined;
  }
  // ```
  // sendNativeQuery('foo', function(){...}, ()=>{…})
  // ```
  else if (arguments.length === 3 && _.isFunction(_valuesToEscape)) {
    _meta = explicitCb;
    explicitCb = _valuesToEscape;
    _valuesToEscape = undefined;
  }

  return parley(function _handleExec(done){

    // ████████╗    ███████╗███████╗██╗     ███████╗ ██████╗████████╗ ██████╗ ██████╗ 
    // ╚══██╔══╝    ██╔════╝██╔════╝██║     ██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
    //    ██║       ███████╗█████╗  ██║     █████╗  ██║        ██║   ██║   ██║██████╔╝
    //    ██║       ╚════██║██╔══╝  ██║     ██╔══╝  ██║        ██║   ██║   ██║██╔══██╗
    //    ██║██╗    ███████║███████╗███████╗███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║
    //    ╚═╝╚═╝    ╚══════╝╚══════╝╚══════╝╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

    sails.nativeTenancy(req, ignore_tenancy, _self).then(datastore => {

      const adapter = sails.hooks.orm.adapters[datastore.config.adapter];
      let genericDoesNotSupportDatastoreMethodsError = adapterSupportVerify(adapter, datastore.name);

      // Verifiy driver query capability
      var driverMethodNames = _.keys(datastore.driver);

      var isConnectable = _.difference([
        'createManager',
        'destroyManager',
        'getConnection',
        'releaseConnection'
      ], driverMethodNames)
      .length === 0;

      var isQueryable = isConnectable && _.difference([
        'sendNativeQuery',
        'compileStatement',
        'parseNativeQueryResult',
        'parseNativeQueryError'
      ], driverMethodNames)
      .length === 0;

      if (genericDoesNotSupportDatastoreMethodsError) {
        return done(genericDoesNotSupportDatastoreMethodsError);
      }

      var options = {
        manager: datastore.manager,
        driver: datastore.driver,
        connection: undefined,
    
        nativeQuery: _nativeQuery,
        valuesToEscape: _valuesToEscape,
        meta: _meta,
      };
    
      if (more) {
        _.extend(options, more);
      }

      if (!isQueryable) {
        return done(flaverr('E_NOT_SUPPORTED', new Error(
          'Cannot use `.sendNativeQuery()` with this datastore because the underlying adapter '+
          'does not implement the "queryable" interface layer.  This may be because of a '+
          'natural limitation of the technology, or it could just be that the adapter\'s '+
          'developer(s) have not finished implementing one or more driver methods.'
        )));
      }

      if (!options.nativeQuery) {
        return done(flaverr({ name: 'UsageError' }, new Error(
          'Invalid native query passed in to `.sendNativeQuery()`.  (Must be truthy-- e.g. "SELECT * FROM foo")'
        )));
      }

      helpSendNativeQuery(options, done);
    });
  }, explicitCb, {

    meta: function(_meta){
      options.meta = _meta;
      return this;
    },

    usingConnection: function(_usingConnection){
      options.connection = _usingConnection;
      return this;
    },

  });//</parley()>

};