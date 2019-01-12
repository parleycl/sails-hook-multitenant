/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('parley');
var buildOmen = require('waterline/lib/waterline/utils/query/build-omen');
var forgeStageTwoQuery = require('waterline/lib/waterline/utils/query/forge-stage-two-query');
var getQueryModifierMethods = require('waterline/lib/waterline/utils/query/get-query-modifier-methods');
var helpFind = require('../utils/help-find');
var processAllRecords = require('waterline/lib/waterline/utils/query/process-all-records');
var verifyModelMethodContext = require('waterline/lib/waterline/utils/query/verify-model-method-context');
var _datasources = require('../../methods/getdatasources');


/**
 * Module constants
 */

var DEFERRED_METHODS = getQueryModifierMethods('findOne');


/**
 * findOne()
 *
 * Find the record matching the specified criteria.
 *
 * ```
 * // Look up the bank account with exactly $34,986 in it.
 * BankAccount.findOne().where({
 *   balance: { '>': 34986 }
 * }).exec(function(err, bankAccount) {
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
 * @param {Dictionary} populates
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
 * @qkey {Dictionary?} populates
 *
 * @qkey {Dictionary?} meta
 * @qkey {String} using
 * @qkey {String} method
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function findOne( /* criteria?, populates?, explicitCbMaybe?, meta? */ ) {

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

  // Build an omen for potential use in the asynchronous callbacks below.
  var omen = buildOmen(findOne);

  // Build query w/ initial, universal keys.
  var query = {
    method: 'findOne',
    using: modelIdentity
  };


  //  ██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗ ██████╗███████╗
  //  ██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║██╔════╝██╔════╝
  //  ██║   ██║███████║██████╔╝██║███████║██║  ██║██║██║     ███████╗
  //  ╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██║  ██║██║██║     ╚════██║
  //   ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝██║╚██████╗███████║
  //    ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝╚══════╝
  //

  // The `explicitCbMaybe` callback, if one was provided.
  var explicitCbMaybe;
  //Define the req tenancy object
  var req;

  // Handle the various supported usage possibilities
  // (locate the `explicitCbMaybe` callback, and extend the `query` dictionary)
  //
  // > Note that we define `args` so that we can insulate access
  // > to the arguments provided to this function.
  // var args = arguments;
  var args = Array.from(arguments);
  
  (function _handleVariadicUsage() {
    // The metadata container, if one was provided.
    var _meta;

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

    // Handle first argument:
    //
    // • findOne(criteria, ...)
    query.criteria = args[0];


    // Handle double meaning of second argument:
    //
    // • findOne(..., populates, explicitCbMaybe, _meta)
    var is2ndArgDictionary = (_.isObject(args[1]) && !_.isFunction(args[1]) && !_.isArray(args[1]));
    if (is2ndArgDictionary) {
      query.populates = args[1];
      explicitCbMaybe = args[2];
      _meta = args[3];
    }
    // • findOne(..., explicitCbMaybe, _meta)
    else {
      explicitCbMaybe = args[1];
      _meta = args[2];
    }

    // Fold in `_meta`, if relevant.
    if (_meta) {
      query.meta = _meta;
    } // >-

  })();


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
  // If an explicit callback function was specified, then immediately run the logic below
  // and trigger the explicit callback when the time comes.  Otherwise, build and return
  // a new Deferred now. (If/when the Deferred is executed, the logic below will run.)
  return parley(

    function (done){

      // Otherwise, IWMIH, we know that it's time to actually do some stuff.
      // So...
      //
      //  ███████╗██╗  ██╗███████╗ ██████╗██╗   ██╗████████╗███████╗
      //  ██╔════╝╚██╗██╔╝██╔════╝██╔════╝██║   ██║╚══██╔══╝██╔════╝
      //  █████╗   ╚███╔╝ █████╗  ██║     ██║   ██║   ██║   █████╗
      //  ██╔══╝   ██╔██╗ ██╔══╝  ██║     ██║   ██║   ██║   ██╔══╝
      //  ███████╗██╔╝ ██╗███████╗╚██████╗╚██████╔╝   ██║   ███████╗
      //  ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚══════╝

      //  ╔═╗╔═╗╦═╗╔═╗╔═╗  ┌─┐┌┬┐┌─┐┌─┐┌─┐  ┌┬┐┬ ┬┌─┐  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
      //  ╠╣ ║ ║╠╦╝║ ╦║╣   └─┐ │ ├─┤│ ┬├┤    │ ││││ │  │─┼┐│ │├┤ ├┬┘└┬┘
      //  ╚  ╚═╝╩╚═╚═╝╚═╝  └─┘ ┴ ┴ ┴└─┘└─┘   ┴ └┴┘└─┘  └─┘└└─┘└─┘┴└─ ┴
      //
      // Forge a stage 2 query (aka logical protostatement)

      // Tenancy Definition of decition

      _self.tenancy(req, ignore_tenancy).then(model => {
        try {
          forgeStageTwoQuery(query, orm);
        } catch (e) {
          switch (e.code) {
  
            case 'E_INVALID_CRITERIA':
              return done(
                flaverr({
                  name: 'UsageError',
                  code: e.code,
                  details: e.details,
                  message:
                  'Invalid criteria.\n' +
                  'Details:\n' +
                  '  ' + e.details + '\n'
                }, omen)
              );
  
            case 'E_INVALID_POPULATES':
              return done(
                flaverr({
                  name: 'UsageError',
                  code: e.code,
                  details: e.details,
                  message:
                  'Invalid populate(s).\n' +
                  'Details:\n' +
                  '  ' + e.details + '\n'
                }, omen)
              );
  
            case 'E_NOOP':
              return done(undefined, undefined);
  
            default:
              return done(e);
          }
        } // >-•
  
  
        //  ┬ ┬┌─┐┌┐┌┌┬┐┬  ┌─┐  ╔╗ ╔═╗╔═╗╔═╗╦═╗╔═╗  ┬  ┬┌─┐┌─┐┌─┐┬ ┬┌─┐┬  ┌─┐  ┌─┐┌─┐┬  ┬  ┌┐ ┌─┐┌─┐┬┌─
        //  ├─┤├─┤│││ │││  ├┤   ╠╩╗║╣ ╠╣ ║ ║╠╦╝║╣   │  │├┤ ├┤ │  └┬┘│  │  ├┤   │  ├─┤│  │  ├┴┐├─┤│  ├┴┐
        //  ┴ ┴┴ ┴┘└┘─┴┘┴─┘└─┘  ╚═╝╚═╝╚  ╚═╝╩╚═╚═╝  ┴─┘┴└  └─┘└─┘ ┴ └─┘┴─┘└─┘  └─┘┴ ┴┴─┘┴─┘└─┘┴ ┴└─┘┴ ┴
        // Determine what to do about running any lifecycle callbacks
        (function _maybeRunBeforeLC(proceed){
  
          // If the `skipAllLifecycleCallbacks` meta key was enabled, then don't run this LC.
          if (_.has(query.meta, 'skipAllLifecycleCallbacks') && query.meta.skipAllLifecycleCallbacks) {
            return proceed(undefined, query);
          }//-•
  
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // FUTURE: This is where the `beforeFindOne()` lifecycle callback would go
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          return proceed(undefined, query);
  
        })(function _afterPotentiallyRunningBeforeLC(err, query) {
          if (err) {
            return done(err);
          }
  
          // ================================================================================
          // FUTURE: potentially bring this back (but also would need the `omit clause`)
          // ================================================================================
          // // Before we get to forging again, save a copy of the stage 2 query's
          // // `select` clause.  We'll need this later on when processing the resulting
          // // records, and if we don't copy it now, it might be damaged by the forging.
          // //
          // // > Note that we don't need a deep clone.
          // // > (That's because the `select` clause is only 1 level deep.)
          // var s2QSelectClause = _.clone(query.criteria.select);
          // ================================================================================
  
  
          //  ┌─┐┌─┐┌┐┌┌┬┐  ┌┬┐┌─┐  ╔═╗╔╦╗╔═╗╔═╗╔╦╗╔═╗╦═╗
          //  └─┐├┤ │││ ││   │ │ │  ╠═╣ ║║╠═╣╠═╝ ║ ║╣ ╠╦╝
          //  └─┘└─┘┘└┘─┴┘   ┴ └─┘  ╩ ╩═╩╝╩ ╩╩   ╩ ╚═╝╩╚═
          // Use `helpFind()` to forge stage 3 quer(y/ies) and then call the appropriate adapters' method(s).
          // > Note: `helpFind` is responsible for running the `transformer`.
          // > (i.e. so that column names are transformed back into attribute names)
          helpFind(model, query, omen, function _afterFetchingRecords(err, populatedRecords) {

            if (err) {
              return done(err);
            }//-•
            // console.log('result from operation runner:', record);
  
            // If more than one matching record was found, then consider this an error.
            if (populatedRecords.length > 1) {
              return done(new Error(
                'More than one matching record found for `.findOne()`:\n'+
                '```\n'+
                _.pluck(populatedRecords, WLModel.primaryKey)+'\n'+
                '```\n'+
                '\n'+
                'Criteria used:\n'+
                '```\n'+
                util.inspect(query.criteria,{depth:5})+''+
                '```'
              ));
            }//-•
  
            // Check and see if we actually found a record.
            var thePopulatedRecord = _.first(populatedRecords);
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // FUTURE: Allow a `mustExist: true` meta key to be specified, probably via the use of a simple new query
            // method-- something like `.mustExist()`.  If set, then if the record is not found, bail with an error.
            // This is just a nicety to simplify some of the more annoyingly repetitive userland code that one needs
            // to write in a Node/Sails app.
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  
            // If so...
            if (thePopulatedRecord) {
  
              // Check the record to verify compliance with the adapter spec,
              // as well as any issues related to stale data that might not have been
              // been migrated to keep up with the logical schema (`type`, etc. in
              // attribute definitions).
              try {
                processAllRecords([ thePopulatedRecord ], query.meta, modelIdentity, orm);
              } catch (e) { return done(e); }
  
            }//>-
  
            //  ┬ ┬┌─┐┌┐┌┌┬┐┬  ┌─┐  ╔═╗╔═╗╔╦╗╔═╗╦═╗  ┬  ┬┌─┐┌─┐┌─┐┬ ┬┌─┐┬  ┌─┐  ┌─┐┌─┐┬  ┬  ┌┐ ┌─┐┌─┐┬┌─
            //  ├─┤├─┤│││ │││  ├┤   ╠═╣╠╣  ║ ║╣ ╠╦╝  │  │├┤ ├┤ │  └┬┘│  │  ├┤   │  ├─┤│  │  ├┴┐├─┤│  ├┴┐
            //  ┴ ┴┴ ┴┘└┘─┴┘┴─┘└─┘  ╩ ╩╚   ╩ ╚═╝╩╚═  ┴─┘┴└  └─┘└─┘ ┴ └─┘┴─┘└─┘  └─┘┴ ┴┴─┘┴─┘└─┘┴ ┴└─┘┴ ┴
            (function _maybeRunAfterLC(proceed){
  
              // If the `skipAllLifecycleCallbacks` meta key was enabled, then don't run this LC.
              if (_.has(query.meta, 'skipAllLifecycleCallbacks') && query.meta.skipAllLifecycleCallbacks) {
                return proceed(undefined, thePopulatedRecord);
              }//-•
  
              // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              // FUTURE: This is where the `afterFindOne()` lifecycle callback would go
              // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              return proceed(undefined, thePopulatedRecord);
  
            })(function _afterPotentiallyRunningAfterLC(err, thePopulatedRecord){
              if (err) { return done(err); }
  
              // All done.
              return done(undefined, thePopulatedRecord);
  
            });//</ self-calling function to handle "after" lifecycle callback >
          }); //</ helpFind() >
        }); //</ self-calling function to handle "before" lifecycle callback >
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
