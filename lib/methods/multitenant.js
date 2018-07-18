module.exports = async function multitenant(req, model, self, sails, schema) {
    const _self = self;
    return new Promise((resolve,reject) => {
        model._adapter.registerDatastore({ host: 'localhost',
        port: 3306,
        schema: true,
        adapter: 'sails-mysql',
        user: 'root',
        password: 'shadowfax',
        database: 'perro',
        identity: 'perro' }, schema, function(){
            _self.datastore = 'perro';
            resolve(_self)
        });
    });  
}