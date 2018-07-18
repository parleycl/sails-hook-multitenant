module.exports = async function getschemas(sails) {
    var SchemaMap = {};
    //Creamos los schemas
    for(key in sails.hooks.orm.models) {
        WLModel = sails.hooks.orm.models[key];
        SchemaMap[WLModel.tableName] = {
            primaryKey: WLModel.primaryKey,
            definition: WLModel.schema,
            tableName: WLModel.tableName,
            identity: WLModel.identity
        }
    }
    return SchemaMap;
}