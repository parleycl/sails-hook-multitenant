module.exports.datasource = function DataStoreConfig(host, port, schema, adapter, user, password, database) {
    // Define the properties of datasource
    this.host = null;
    this.port = null;
    this.schema = null;
    this.adapter = null;
    this.user = null;
    this.password = null;
    this.database = null;
    this.identity = null;

    var _self = this;
    
    // constructor
    function _constructor(host, port, schema, adapter, user, password, database, identity) {
        if (_self.cleanArguments(arguments).length == 1 && typeof arguments[0] === 'object'){
            _self.host = arguments[0].host;
            _self.port = arguments[0].port;
            _self.schema = arguments[0].schema;
            _self.adapter = arguments[0].adapter;
            _self.user = arguments[0].user;
            _self.password = arguments[0].password;
            _self.database = arguments[0].database;
            _self.identity = arguments[0].identity;
            _self.validate();
        } else {
            _self.host = host;
            _self.port = port;
            _self.schema = schema;
            _self.adapter = adapter;
            _self.user = user;
            _self.password = password;
            _self.database = database;
            if(identity) _self.identity = identity;
        }
    }

    /**
     * Clean the arguments array to get an clean array
     * 
     * @param args An arguments array
     */
    this.cleanArguments = function(args) {
        for (key in args) {
            if(args[key] === undefined) delete args[key];
        }
        return Object.values(args);
    }

    // validate the object when is build from object
    this.validate = function(){
        if(!_self.host) throw new Error('The datasource object not specify the host propertie');
        if(!_self.port) throw new Error('The datasource object not specify the port propertie');
        if(!_self.schema) throw new Error('The datasource object not specify the schema propertie');
        if(!_self.adapter) throw new Error('The datasource object not specify the adapter propertie');
        if(!_self.user) throw new Error('The datasource object not specify the user propertie');
        if(!_self.password) throw new Error('The datasource object not specify the password propertie');
        if(!_self.database) throw new Error('The datasource object not specify the database propertie');
        if(!_self.identity) throw new Error('The datasource object not specify the identity propertie');
    }
    // run the constructor
    _constructor(host, port, schema, adapter, user, password, database);
}

module.exports.isDatasource = function(obj) {
    if(!obj.host) return false;
    if(!obj.port) return false;
    if(!obj.schema) return false;
    if(!obj.adapter) return false;
    if(!obj.user) return false;
    if(!obj.password) return false;
    if(!obj.database) return false;

    return true;
}