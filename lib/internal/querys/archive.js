/**
 * Module Dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('parley');
var buildOmen = require('waterline/lib/waterline/utils/query/build-omen');
var getModel = require('waterline/lib/waterline/utils/ontology/get-model');
var forgeStageTwoQuery = require('waterline/lib/waterline/utils/query/forge-stage-two-query');
var getQueryModifierMethods = require('waterline/lib/waterline/utils/query/get-query-modifier-methods');
var verifyModelMethodContext = require('waterline/lib/waterline/utils/query/verify-model-method-context');
var _datasources = require('../../methods/getdatasources');

/**
 * Module constants
 */

var DEFERRED_METHODS = getQueryModifierMethods('archive');



/**
 * archive()
 *
 * Archive (s.k.a. "soft-delete") records that match the specified criteria,
 * saving them as new records in the built-in Archive model, then destroying
 * the originals.
 *
 * ```
 * // Archive all bank accounts with more than $32,000 in them.
 * BankAccount.archive().where({
 *   balance: { '>': 32000 }
 * }).exec(function(err) {
 *   // ...
 * });
 * ```
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * Usage without deferred object:
 * ================================================
 *
 * @param {Dictionary?} criteria
 *
 * @param {Function?} explicitCbMaybe
 *        Callback function to run when query has either finished successfully or errored.
 *        (If unspecified, will return a Deferred object instead of actually doing anything.)
 *
 * @param {Ref?} meta
 *     For internal use.
 *
 * @returns {Ref?} Deferred object if no `explicitCbMaybe` callback was provided
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * The underlying query keys:
 * ==============================
 *
 * @qkey {Dictionary?} criteria
 *
 * @qkey {Dictionary?} meta
 * @qkey {String} using
 * @qkey {String} method
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function archive(/* criteria, explicitCbMaybe, metaContainer */) {
  
  // Tenancy construction
  const _self = this;
  _self.datastore = _self.s_datastore;
  var ignore_tenancy = true;
  // Get datasource
  const datasources = _datasources(_self);

  // Verify `this` refers to an actual Sails/Waterline model.
  verifyModelMethodContext(this);

  // Set up a few, common local vars for convenience / familiarity.
  var WLModel = this;
  var orm = this.waterline;
  var modelIdentity = this.identity;

  // Build an omen for potential use in the asynchronous callback below.
  var omen = buildOmen(archive);

  // Build initial query.
  var query = {
    method: 'archive',
    using: modelIdentity,
    criteria: undefined,
    meta: undefined
  };

  //  ██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗ ██████╗███████╗
  //  ██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║██╔════╝██╔════╝
  //  ██║   ██║███████║██████╔╝██║███████║██║  ██║██║██║     ███████╗
  //  ╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██║  ██║██║██║     ╚════██║
  //   ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝██║╚██████╗███████║
  //    ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝╚══════╝
  //
  // FUTURE: when time allows, update this to match the "VARIADICS" format
  // used in the other model methods.

  // The explicit callback, if one was provided.
  var explicitCbMaybe;

  //Define the req tenancy object
  var req;

  // Define the args array to get the tenancy var
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }

  // Tenancy req  argument analisis
  if (typeof args[0] === 'string' || typeof args[0] === 'object') {
    if(typeof args[0] === 'string' && datasources.searchStringIdentity(args[0])) {
      req = args[0];
      args.splice(0,1);
      ignore_tenancy = false;
    } else if (typeof args[0] === 'object' && (args[0].constructor.name === 'IncomingMessage' || args[0].constructor.name === 'DataStoreConfig')) {
      req = args[0];
      args.splice(0,1);
      ignore_tenancy = false;
    }
  }

  // Handle double meaning of first argument:
  //
  // • archive(criteria, ...)
  if (!_.isFunction(args[0])) {
    query.criteria = args[0];
    explicitCbMaybe = args[1];
    query.meta = args[2];
  }
  // • archive(explicitCbMaybe, ...)
  else {
    explicitCbMaybe = args[0];
    query.meta = args[1];
  }



  //  ██████╗ ███████╗███████╗███████╗██████╗
  //  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗
  //  ██║  ██║█████╗  █████╗  █████╗  ██████╔╝
  //  ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗
  //  ██████╔╝███████╗██║     ███████╗██║  ██║
  //  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
  //
  //   ██╗███╗   ███╗ █████╗ ██╗   ██╗██████╗ ███████╗██╗
  //  ██╔╝████╗ ████║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔════╝╚██╗
  //  ██║ ██╔████╔██║███████║ ╚████╔╝ ██████╔╝█████╗   ██║
  //  ██║ ██║╚██╔╝██║██╔══██║  ╚██╔╝  ██╔══██╗██╔══╝   ██║
  //  ╚██╗██║ ╚═╝ ██║██║  ██║   ██║   ██████╔╝███████╗██╔╝
  //   ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝
  //
  //  ┌┐ ┬ ┬┬┬  ┌┬┐   ┬   ┬─┐┌─┐┌┬┐┬ ┬┬─┐┌┐┌  ┌┐┌┌─┐┬ ┬  ┌┬┐┌─┐┌─┐┌─┐┬─┐┬─┐┌─┐┌┬┐
  //  ├┴┐│ │││   ││  ┌┼─  ├┬┘├┤  │ │ │├┬┘│││  │││├┤ │││   ││├┤ ├┤ ├┤ ├┬┘├┬┘├┤  ││
  //  └─┘└─┘┴┴─┘─┴┘  └┘   ┴└─└─┘ ┴ └─┘┴└─┘└┘  ┘└┘└─┘└┴┘  ─┴┘└─┘└  └─┘┴└─┴└─└─┘─┴┘
  //  ┌─    ┬┌─┐  ┬─┐┌─┐┬  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐    ─┐
  //  │───  │├┤   ├┬┘├┤ │  ├┤ └┐┌┘├─┤│││ │   ───│
  //  └─    ┴└    ┴└─└─┘┴─┘└─┘ └┘ ┴ ┴┘└┘ ┴     ─┘
  // If a callback function was not specified, then build a new Deferred and bail now.
  //
  // > This method will be called AGAIN automatically when the Deferred is executed.
  // > and next time, it'll have a callback.
  return parley(

    function (done){

      // Otherwise, IWMIH, we know that a callback was specified.
      // So...

      //  ███████╗██╗  ██╗███████╗ ██████╗██╗   ██╗████████╗███████╗
      //  ██╔════╝╚██╗██╔╝██╔════╝██╔════╝██║   ██║╚══██╔══╝██╔════╝
      //  █████╗   ╚███╔╝ █████╗  ██║     ██║   ██║   ██║   █████╗
      //  ██╔══╝   ██╔██╗ ██╔══╝  ██║     ██║   ██║   ██║   ██╔══╝
      //  ███████╗██╔╝ ██╗███████╗╚██████╗╚██████╔╝   ██║   ███████╗
      //  ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚══════╝
      //
      //  ╔═╗╔═╗╦═╗╔═╗╔═╗  ┌─┐┌┬┐┌─┐┌─┐┌─┐  ┌┬┐┬ ┬┌─┐  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
      //  ╠╣ ║ ║╠╦╝║ ╦║╣   └─┐ │ ├─┤│ ┬├┤    │ ││││ │  │─┼┐│ │├┤ ├┬┘└┬┘
      //  ╚  ╚═╝╩╚═╚═╝╚═╝  └─┘ ┴ ┴ ┴└─┘└─┘   ┴ └┴┘└─┘  └─┘└└─┘└─┘┴└─ ┴
      //
      // Forge a stage 2 query (aka logical protostatement)
      // This ensures a normalized format.
      // Make the tenancy decition
      _self.tenancy(req, ignore_tenancy).then(model => {
        try {
          forgeStageTwoQuery(query, orm);
        } catch (err) {
          switch (err.code) {
            case 'E_INVALID_CRITERIA':
              return done(
                flaverr({
                  name: 'UsageError',
                  code: err.code,
                  details: err.details,
                  message:
                  'Invalid criteria.\n'+
                  'Details:\n'+
                  '  '+err.details+'\n'
                }, omen)
              );
  
            case 'E_NOOP':
              // Determine the appropriate no-op result.
              // If `fetch` meta key is set, use `[]`-- otherwise use `undefined`.
              var noopResult = undefined;
              if (query.meta && query.meta.fetch) {
                noopResult = [];
              }//>-
              return done(undefined, noopResult);
  
            default:
              return done(err);
          }
        }//ﬁ
  
        // Bail now if archiving has been disabled.
        if (!WLModel.archiveModelIdentity) {
          return done(flaverr({
            name: 'UsageError',
            message: 'Since the `archiveModelIdentity` setting was explicitly disabled, .archive() cannot be used.'
          }, omen));
        }//•
  
        // Look up the Archive model.
        var Archive = WLModel.archiveModelIdentity;
        try {
          Archive = getModel(WLModel.archiveModelIdentity, orm);
        } catch (err) { return done(err); }//ﬁ
  
  
        // - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: pass through the `omen` in the metadata.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: Maybe refactor this into more-generic `.move()` and/or
        // `.copy()` methods for migrating data between models/datastores.
        // Then just leverage those methods here in `.archive()`.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  
        //  ╔═╗═╗ ╦╔═╗╔═╗╦ ╦╔╦╗╔═╗  ┌─┐┬┌┐┌┌┬┐  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
        //  ║╣ ╔╩╦╝║╣ ║  ║ ║ ║ ║╣   ├┤ ││││ ││  │─┼┐│ │├┤ ├┬┘└┬┘
        //  ╚═╝╩ ╚═╚═╝╚═╝╚═╝ ╩ ╚═╝  └  ┴┘└┘─┴┘  └─┘└└─┘└─┘┴└─ ┴
        // Note that we pass in `meta` here, as well as in the other queries
        // below.  (This ensures we're on the same db connection, provided one
        // was explicitly passed in!)
        WLModel.find(query.criteria, function _afterFinding(err, foundRecords) {
          if (err) { return done(err); }
  
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // FUTURE: as an optimization, fetch records batch-at-a-time
          // using .stream() instead of just doing a naïve `.find()`.
          // (This would allow you to potentially archive millions of records
          // at a time without overflowing RAM.)
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          var archives = [];
          _.each(foundRecords, function(record){
            archives.push({
              originalRecord: record,
              originalRecordId: record[WLModel.primaryKey],
              fromModel: WLModel.identity,
            });
          });//∞
  
          //  ╔═╗═╗ ╦╔═╗╔═╗╦ ╦╔╦╗╔═╗  ┌─┐┬─┐┌─┐┌─┐┌┬┐┌─┐┌─┐┌─┐┌─┐┬ ┬  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
          //  ║╣ ╔╩╦╝║╣ ║  ║ ║ ║ ║╣   │  ├┬┘├┤ ├─┤ │ ├┤ ├┤ ├─┤│  ├─┤  │─┼┐│ │├┤ ├┬┘└┬┘
          //  ╚═╝╩ ╚═╚═╝╚═╝╚═╝ ╩ ╚═╝  └─┘┴└─└─┘┴ ┴ ┴ └─┘└─┘┴ ┴└─┘┴ ┴  └─┘└└─┘└─┘┴└─ ┴
          Archive.createEach(archives, function _afterCreatingEach(err) {
            if (err) { return done(err); }
  
            // Remove the `limit`, `skip`, `sort`, `select`, and `omit` clauses so
            // that our `destroy` query is valid.
            // (This is because they were automatically attached above in the forging.)
            delete query.criteria.limit;
            delete query.criteria.skip;
            delete query.criteria.sort;
            delete query.criteria.select;
            delete query.criteria.omit;
  
            //  ╔═╗═╗ ╦╔═╗╔═╗╦ ╦╔╦╗╔═╗  ┌┬┐┌─┐┌─┐┌┬┐┬─┐┌─┐┬ ┬  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
            //  ║╣ ╔╩╦╝║╣ ║  ║ ║ ║ ║╣    ││├┤ └─┐ │ ├┬┘│ │└┬┘  │─┼┐│ │├┤ ├┬┘└┬┘
            //  ╚═╝╩ ╚═╚═╝╚═╝╚═╝ ╩ ╚═╝  ─┴┘└─┘└─┘ ┴ ┴└─└─┘ ┴   └─┘└└─┘└─┘┴└─ ┴
            WLModel.destroy(query.criteria, function _afterDestroying(err) {
              if (err) { return done(err); }
  
              if (query.meta&&query.meta.fetch){
                return done(undefined, foundRecords);
              }
              else {
                return done();
              }
  
            }, query.meta);//</.destroy()>
          }, query.meta);//</.createEach()>
        }, query.meta);//</.find()>
      });

    },


    explicitCbMaybe,


    _.extend(DEFERRED_METHODS, {

      // Provide access to this model for use in query modifier methods.
      _WLModel: WLModel,

      // Set up initial query metadata.
      _wlQueryInfo: query,

    })


  );//</parley>

};
