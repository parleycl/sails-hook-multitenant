module.exports = function(model, config, identity, schema, callback) {
    model._adapter.registerDatastore({ host: config.host,
    port: config.port,
    schema: config.schema,
    adapter: config.adapter,
    user: config.user,
    password: config.password,
    database: config.database,
    identity: identity }, schema, callback);
}