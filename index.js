var _initialize = require('./lib/initialize');
var _defaults = require('./lib/defaults');

module.exports = function multitenant(sails) {
    return {
        defaults: _defaults,
        initialize: function(next) {
            _initialize(sails, next);
        }
    }
}
