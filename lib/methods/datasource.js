module.exports.datasource = function DataStoreConfig(host, port, schema, adapter, user, password, database) {
    // Define the properties of datasource
    this.host = null;
    this.port = null;
    this.schema = null;
    this.adapter = null;
    this.user = null;
    this.password = null;
    this.database = null;

    _self = this;
    
    // constructor
    function _constructor(host, port, schema, adapter, user, password, database) {
        _self.host = host;
        _self.port = port;
        _self.schema = schema;
        _self.adapter = adapter;
        _self.user = user;
        _self.password = password;
        _self.database = database;
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