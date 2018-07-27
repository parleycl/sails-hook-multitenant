![tea love](https://raw.githubusercontent.com/acalvoa/sails-hook-multitenant/master/assets/logo.png)

## 1. Introduction
Sails Multitenant ORM Project was develop to give to Waterline ORM , The main ORM implemented in Sails 1.0, the capability to use the Multi Tenant Arquitecture. 

This is a not invasive method, because is a plug & play hook, made follow the hooks specification provided by sails to add a group of function that transform the traditional ORM into multitenancy ORM with full compatibility with traditional operations with a single tenant.


Sails Multitanency ORM project is perfect for new app that need a multi tenant arquitecture or if you have an app that need multi tenant database operations, because you don't need modify nothing if you had made code with the traditional methods provided by Sails Framework.

Try Sails Multitenant ORM Project and put steroids in your Waterline ORM.

## 2. Get started

You need npm or yarn to install the hooks into your Sails app.

```bash
# To install with npm
npm install sails-hook-multitenant --save
# To install with yarn
yarn install sails-hook-multitenant --save
```
If you want created a new sails project with multitenant

```bash
# Create a new sails project
sail new project_name
# Enter to project
cd project_name
# To install with npm
npm install sails-hook-multitenant --save
# To install with yarn
yarn install sails-hook-multitenant --save
# Lift your app
sails lift
```
## 3. Configuration

The hook comes ready to use, but if you use the Request object to determine the tenant in the requests, you need define a tenant selector function into sails configuration folder. Use and extend the next code to write your own tenant selection function in order to use the Request Object in tenants requests.

```javascript
module.exports.multitenancy = function(req){
    // The function need return a Promise to select the tenant
    return new Promise(async (resolve, reject) => {
        // The code was here
        // If you want use a database, redis or file
        // you can be here.
        // ....
        // ....
        // You need return a object with the tenant information with the next structure
        // const datasourse = {
        //   "host": #####, (String - The host of datasource)
        //   "port": #####, (Number - The port of datasource)
        //   "schema": ######, (Boolean - Determine if the datasource use schameas 
        //   in the tables or is a schamless datasource)
        //   "adapter": ######, (String - Indicates the driver use for 
        //   the datasource. Example: sails-mysql) 
        //   "user": ######, (String - Indicates the user of datasource)
        //   "password": ######, (String - Indicates the password of datasource)
        //   "database": ######, (String - Indicates the name of database in datasource)
        //   "identity": ###### (String - Indicate the name of datasource)
        // }
        //
        // ********************************************************
        // Or you can use the datasource object provided by the hook
        // Import to use in the function
        // const _datasource = require('sails-hook-multitenant/datasource');
        // ....
        // ....
        // const datasource = new _datasource(host, port, schema, adapter,
        // user, password, database, identity);
        // ....
        resolve(datasource);
    });
}
```
Save this code into sails configurtion folder with a name you want, **Example** tenancy.js

```bash
(app root)
  |_api
  |_assets
  |_tasks
  |_views
  |_config
      |_tenancy.js
```

## 4. How to use

The hook was build thinkg in three differents uses cases. Each way to use the multi tenant hook make an datasource change by tenant. All models, that want use the multi tenant datasource should have a multitenant boolean propertie equal true defined in the Model Object in order to be multitenant model. If this propertie not exists, the hook ignore this model of  multitenant call. **An example:**

```javascript
/**
 * Client.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: 'string',
    age: 'number'
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },
  multitenant: true
};

```
If you define you model like multitenant, you have three ways to make an multitenant database calls.

### 4.1 The Request Object Way

This way is based on the request object handler by each action in the controllers. Each ORM operations is call using in the first argument, the Request Object. The hook automatically recognize this object and use like argument in the **Tenant selector function** previusly configured in the Sails configuration folder.

The **Tenant selector function** return a configuration object that select and configuring the tenant. If the tenant was previsuly used, the hook dont create a new datasource of this tenant and only use this datasource previusly created.

An example of this, with the Client model previusly defined.

```javascript
/**
 * ClientController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/*****************************************************************/
/* Briefing:                                                     */ 
/* The default database configured in datasource is "multitenant"*/
/* "client1" database is a tenant database asociate to           */
/* client1.rockstart.com domain. The tenant database call need   */
/* use the datasource asign to this domain.                      */
/*****************************************************************/
module.exports = {
  
    find: async function(req, res) {
        // To make this posible the Req object have the domain and can be 
        // associate this domain to select the datasource. In this case we
        // utilized the Request Object Way.
        const client = await Client.create(req, {
            name: 'client1',
            edad: 24
        });
        // Call all the clients in the tenant (In this example only one
        // register)
        const clients = await Client.find(req);
        // A normal call to "multitenant" database with the same table
        // But this table is empty
        const test = await Client.find();
        return res.ok({
            client: clients,
            compare: test
        });
    }
};
```
The configuration function should be:

```javascript
/******************************************************************/
/* Briefing:                                                      */ 
/* The default database configured in datasource is "multitenant" */
/* have a table with all Tenant named Tenants. We created a model */
/* Tenant to get the tenants based on the domain.                 */
/*                                                                */
/******************************************************************/
const Datasource = require('sails-hook-multitenant/datasource');

module.exports.multitenancy = function(req){
    // We call the tenants model defined in our sails app
    const Tenants = sails.models.tenants;
    // this function require return a Promise
    return new Promise(async (resolve, reject) => {
        // Search the tenant in the database based on the domain identifier
        const datasource = await Tenants.findOne({
            identity: req.hostname
        });
        // Return a Datasource object
        resolve(new Datasource(datasource));
    });
}
```

The Tenant Model should be:

```javascript
/**
 * Tenants.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    host: 'string',
    port: 'number',
    schema: 'boolean',
    adapter: 'string',
    user: 'string',
    password: 'string',
    database: 'string',
    identity: 'string'
  },
};
```
The result of call the controller should be:

```javascript
{
    // The array with the client table in the database configured dinamically by the multitenant hook
    client: [
        {
        "name": "client1",
        "age": 24
        }
    ],
    // The array with the client table in the database configured in sails datasource. Should be 0 regsiters
    compare: []
}
```

### 4.2 The configuration Object Way

This way is similar to Request Object but the selection of the tenant is handle direct from the controller. The database operations is made with the configuration datasource object all the times.

An example of this, with the Client model previusly defined.

```javascript
/**
 * ClientController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/******************************************************************/
/* Briefing:                                                      */ 
/* The default database configured in datasource is "multitenant" */
/* "client1" database is a tenant database asociate to a client1  */
/*                                                                */
/******************************************************************/
const Datasource = require('sails-hook-multitenant/datasource');

module.exports = {
  
    find: async function(req, res) {
        // To make this posible we need create a Datasource configuration
        // Object
        const datasource = new Datasource('localhost', 3306, true,
        'sails-mysql', 'user', 'password', 'client1', 'client1');
        const client = await Client.create(datasource, {
            name: 'client1_config',
            edad: 27
        });
        // Call all the clients in the tenant (In this example only one
        // register)
        const clients = await Client.find(datasource);
        // A normal call to 'multitenant' database with the same table
        // But this table is empty
        const test = await Client.find();
        return res.ok({
            client: clients,
            compare: test
        });
    }
};
```
The result of call the controller should be:

```javascript
{
    // The array with the client table in the database configured dinamically by the multitenant hook
    client: [
        {
        "name": "client1_config",
        "age": 27
        }
    ],
    // The array with the client table in the database configured in sails datasource. Should be 0 regsiters
    compare: []
}
```

### 4.3 The Datasource creation Way

This way is similar to Configuration Object but the selection of the tenant is by the name of datasource. To make this posible previusly to database operation call we need add the datasource to the models. The database operations is made with the name of datasource in each operation.

An example of this, with the Client model previusly defined.

```javascript
/**
 * ClientController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/******************************************************************/
/* Briefing:                                                      */ 
/* The default database configured in datasource is "multitenant" */
/* "client1" database is a tenant database asociate to a client1  */
/*                                                                */
/******************************************************************/
const Datasource = require('sails-hook-multitenant/datasource');

module.exports = {
  
    find: async function(req, res) {
        // To make this posible we need add datasource previusly to use.
        await Client.addDatasource('client1', {
            'host': 'localhost', 
            'port': 3306, 
            'schema': true,
            'adapter': 'sails-mysql',
            'user': 'user', 
            'password': 'password', 
            'database': 'client1' 
        });
        // Call the database operation with the identifyer
        const client = await Client.create('client1', {
            name: 'client1_add_datasource',
            edad: 27
        });
        // Call all the clients in the tenant (In this example only one
        // register)
        const clients = await Client.find('client1');
        // A normal call to "multitenant" database with the same table
        // But this table is empty
        const test = await Client.find();
        return res.ok({
            client: clients,
            compare: test
        });
    }
};
```
The result of call the controller should be:

```javascript
{
    // The array with the client table in the database configured dinamically by the multitenant hook
    client: [
        {
        "name": "client1_add_datasource",
        "age": 27
        }
    ],
    // The array with the client table in the database configured in sails datasource. Should be 0 regsiters
    compare: []
}
```

## 5. Examples
An example project for study is in the example folder. 

If you have any question of how to use, or any question, please contact.

## 6. Tests
Follow the Sails documentation, the hook is tested with mocha.

```bash
# If you use npm
npm install mocha -g
# if you use yarn
yarn install mocha -g

# Testing the hook
mocha -R spec 
```
This command should be print the follow output.

```bash
  Basic tests ::

==========================================================
 _____   _____   _   _     _____     __  __   _____
|  ___| |  _  | | | | |   |  ___|   |  \/  | |_   _|
| |___  | |_| | | | | |   | |___    |      |   | |
|____ | |  _  | | | | |   |____ |   | |\/| |   | |
 ___| | | | | | | | | |__  ___| |   | |  | |   | |
|_____| |_| |_| |_| |____||_____|   |_|  |_|   |_|

Waterline Multitenant ORM Project
License: MIT
Git: https://www.github.com/acalvoa/sails-hook-multitenant
Made with ❤ in Chile by Rockstart

==========================================================
    ✓ sails does not crash


  1 passing (496ms)

```


## 7. Contributors
Made with ❤ in Chile by Rockstart.


**Knownledge is power, share the Knownledge.**
## 8. License
This project is develop by Rockstart for free use by the community, under MIT license. 

