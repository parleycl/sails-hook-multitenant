module.exports = function getDatasources(model, main) {
    // extract the datasources from model
    var datastores = (main) ? Object.keys(sails.hooks.orm.datastores) : Object.keys(model._adapter.datastores);
    return {
        collection: datastores,
        search: function(identity) {
            if (datastores.indexOf(identity) != -1) return true;
            return false;
        },
        searchStringIdentity: function(identity) {
            const m64identity = Buffer.from(identity).toString('base64');
            if (datastores.indexOf("Mt_" + m64identity+ "_" + identity) != -1) return true;
            return false;
        }
    };
}