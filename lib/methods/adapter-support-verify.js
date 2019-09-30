var flaverr = require('flaverr');
var _ = require('@sailshq/lodash');

module.exports = function adapterSupportVerify(adapter, datastoreName) {
    let genericDoesNotSupportDatastoreMethodsError;

    var GENERIC_UNSUPPORTED_DSM_ERROR_MSG_SUFFIX = ''+
    'If there is an older/ newer version of this adapter, try updating the semver range for this dependency '+
    'in your package.json file.  If you aren\'t sure, check the repo on GitHub, or contact the adapter\'s '+
    'maintainer.  If you *are* the maintainer of this adapter and need help, visit http://sailsjs.com/support.';

    // If this adapter doesn't expose its datastores, then we can't provide any
    // functional datastore methods to allow userland code to work with them.
    //
    // > This is relevant for older adapters, or adapters which only support usage
    // > via models.  Note that this partial level of support may no longer be an
    // > option in future versions of Sails and Waterline.
    if (!_.has(adapter, 'datastores')) {
        genericDoesNotSupportDatastoreMethodsError = flaverr('E_NOT_SUPPORTED', new Error(
        'The adapter used by the `' + datastoreName + '` datastore does not expose '+
        'direct access to its internal datastore entries for use outside the adapter.  '+
        '(It would need to set its own `datastores` property in order to use this method.)\n'+
        GENERIC_UNSUPPORTED_DSM_ERROR_MSG_SUFFIX
        ));
    } else {

        // Try to find the adapter datastore being used.
        //
        // > This should exist in a standardized form to allow us to talk directly to
        // > the driver and access the live manager instance.)
        var adapterDSEntry = adapter.datastores[datastoreName];

        if (!adapterDSEntry) {
            genericDoesNotSupportDatastoreMethodsError = flaverr('E_NOT_SUPPORTED', new Error(
                'The adapter used by the `' + datastoreName + '` datastore does not fully support '+
                'this method.  The adapter\'s exposed `datastores` dictionary is invalid, or is '+
                'missing the expected entry for `' + datastoreName + '`.  (There may be a bug!  '+
                'Or... this adapter might just not support the thing you\'re trying to do.)\n'+
                GENERIC_UNSUPPORTED_DSM_ERROR_MSG_SUFFIX
            ));
            }
        else {

            // Validate that the raw adapter datastore entry we just located provides the right
            // information in the right format.  If it conforms to the spec, it should have
            // `manager`, `driver`, and `config` keys.
            //
            // > Otherwise, we wouldn't actually be capable of running the datastore methods.
            if (!_.has(adapterDSEntry, 'manager') || !_.has(adapterDSEntry, 'driver') || !_.has(adapterDSEntry, 'config')) {
                genericDoesNotSupportDatastoreMethodsError = flaverr('E_NOT_SUPPORTED', new Error(
                'The adapter used by the `' + datastoreName + '` datastore does not fully support '+
                'this method.  The adapter exposes its internal datastore entries as `datastores`, '+
                'and that dictionary even contains the expected datastore entry for `' + datastoreName + '`.  '+
                'But the entry is missing one or more mandatory keys, like `driver`, `manager`, '+
                'or `config`.  (There may be a bug!  Or... this adapter might just not support '+
                'the thing you\'re trying to do.)\n'+
                GENERIC_UNSUPPORTED_DSM_ERROR_MSG_SUFFIX
                ));
            }

        }
    }

    return genericDoesNotSupportDatastoreMethodsError;
}