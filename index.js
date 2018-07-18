var init = require('./lib/initialize');

module.exports = function multitenant(sails) {
    return {
        defaults: {
            __configKey__: {
               _hookTimeout: 5000, // wait 20 seconds before timing out
               name: 'Multitenant ORM',
               //actions: ['create','createEach','find','findOne','update','destroy','findOrCreate','count','stream','archive','avg','sum','removeFromCollection','addToCollection','removeFromCollection','validate','getDatastore'] 
            }
        },
        initialize: function(next) {
            init(sails, next);
        }
    }
}
