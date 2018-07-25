module.exports = function getDatasources(model) {
    // extract the datasources from model
    var datastores = Object.keys(model._adapter.datastores);
    return {
        collection: datastores,
        search: function(identity) {
            if (datastores.indexOf(identity) != -1) return true;
            return false;
        },
        searchStringIdentity: function(identity) {
            const m64identity = Buffer.from(req).toString('base64');
            if (datastores.indexOf("Mt_"+m64identity+"_cf") != -1) return true;
            return false;
        }
    };
}