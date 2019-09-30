var create = require('./querys/create');
var createEach = require('./querys/create-each');
var find = require('./querys/find');
var findOne = require('./querys/find-one');
var update = require('./querys/update');
var destroy = require('./querys/destroy');
var findOrCreate = require('./querys/find-or-create');
var count = require('./querys/count');
var stream = require('./querys/stream');
var archive = require('./querys/archive');
var avg = require('./querys/avg');
var sum = require('./querys/sum');
var removeFromCollection = require('./querys/remove-from-collection');
var replaceCollection = require('./querys/replace-collection');
var addToCollection = require('./querys/add-to-collection');
var validate = require('./querys/validate');
const sendNativeQuery = require('../internal/helpers/send-native-query');

module.exports = {
    create: create,
    createEach: createEach,
    find: find,
    findOne: findOne,
    update: update,
    destroy: destroy,
    findOrCreate: findOrCreate,
    count: count,
    stream: stream,
    archive: archive,
    avg: avg,
    sum: sum,
    removeFromCollection: removeFromCollection,
    replaceCollection: replaceCollection,
    addToCollection: addToCollection,
    validate: validate,
    getDatastore: function(req) {
        const _self = this;
        _self.datastore = _self.s_datastore;
        if (!req) {
            let datastore = _self.s_getDatastore();
            datastore.sendNativeQuery = sendNativeQuery.bind(datastore);
            return datastore;
        } 
        return new Promise(async (resolve,reject) => {
            _self.tenancy(req).then((model_in) => {
                let datastore = model_in.s_getDatastore();
                datastore.sendNativeQuery = sendNativeQuery.bind(datastore);
                resolve(datastore);
            });
        });
    }
};