var _return = require('./return');

module.exports = {
    create: async function(req, initialValues) {
        const _self = this;
        return new Promise(async (resolve,reject) => {
            
            const model_in = await _self.tenancy(req);
            const result = model_in.s_create(initialValues);
            const _retorno = _return(result);
            resolve(_retorno);
        });
    },
    createEach: async function(req, initialValues){
        const _self = this;
        return new Promise(async (resolve,reject) => {
            const model_in = await _self.tenancy(req);
            const result = model_in.s_createEach(initialValues);
            const _retorno = _return(result);
            resolve(_retorno);
        });
    },
    find: async function(req, criteria) {
        const _self = this;
        return new Promise(async (resolve,reject) => {
            if (req && req.constructor.name === 'IncomingMessage') {
                console.log(_self.multitenant);
                const model_in = await _self.tenancy(req);
                const result = await model_in.s_find(criteria);
                resolve(result);
            } else {
                _self.datastore = _self.s_datastore;
                let f_criteria = (req && !criteria) ? req : {};  
                const result = await _self.s_find(f_criteria);
                resolve(result);
            }
        });
    },
    findOne: async function(req, criteria) {
        const _self = this;
        return new Promise(async (resolve,reject) => {
            const model_in = await _self.tenancy(req);
            const result = await model_in.s_findOne(criteria);
            resolve(result);
        });
    },
    update: async function(req, criteria, valuesToSet) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.update(criteria, valuesToSet);
        });
        return result;
    },
    destroy: async function(req, criteria) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.destroy(criteria);
        });
        return result;
    },
    findOrCreate: async function(req, criteria, initialValues) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.findOrCreate(criteria, initialValues);
        });
        return result;
    },
    count: async function(req, criteria) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.count(criteria);
        });
        return result;
    },
    stream: async function(req, criteria) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.stream(criteria);
        });
        return result;
    },
    archive: async function(req, criteria) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.archive(criteria);
        });
        return result;
    },
    avg: async function(req, numericAttrName, criteria) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.avg(numericAttrName, criteria);
        });
        return result;
    },
    sum: async function(req, numericAttrName, criteria) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.sum(numericAttrName, criteria);
        });
        return result;
    },
    removeFromCollection: async function(req, parentId, association) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.removeFromCollection(parentId, association);
        });
        return result;
    },
    addToCollection: async function(req, parentId, association) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.addToCollection(parentId, association);
        });
        return result;
    },
    removeFromCollection: async function(req, parentId, association) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.removeFromCollection(parentId, association);
        });
        return result;
    },
    validate: async function(req, attrName, value) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.validate(attrName, value);
        });
        return result;
    },
    getDatastore: async function(req) {
        const _self = this;
        var result;
        await _self.tenancy(req).then(async function(model){
            result = await model.getDatastore();
        });
        return result;
    }
};