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
## 3. Configuration

The hook comes ready to use, but if you use the Request object to determine the tenant in the requests, you need define a tenant selector function into sails configuration folder. Use and extend the next code to write your own tenant selection function in order to use the Request Object in tenants requests.

```javascript
module.exports.multitenancy = function(req){
    const Tenants = sails.models.tenants;
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
        //   "schema": ######, (Boolean - Determine if the datasource use schameas in the tables or is a schamless datasource)
        //   "adapter": ######, (String - Indicates the driver use for the datasource. Example: sails-mysql) 
        //   "user": ######, (String - Indicates the user of datasource)
        //   "password": ######, (String - Indicates the password of datasource)
        //   "database": ######, (String - Indicates the name of database in datasource)
        //   "identity": ###### (String - Indicate the name of datasource)
        // }
        // Or you can use the datasource object provided by the hook
        // Import to use in the function
        // const _datasource = require('sails-hook-multitenant/datasource');
        // const datasource = new _datasource(host, port, schema, adapter, user, password, database, identity);
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
### The Request Object Way
### The configuration Object Way
### The Datasource creation Way
## 5. Examples
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

