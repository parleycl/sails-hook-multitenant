/**
 * ClientController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
    
    find: async function(req, res) {
        //**************************************************************/
        // REQUEST OBJECT WAY
        //**************************************************************/

        /*****************************************************************/
        /* Briefing:                                                     */ 
        /* The default database configured in datasource is "multitenant"*/
        /* "client1" database is a tenant database asociate to           */
        /* client1.domain.com domain with the table. The tenant database */
        /* call need use the datasource asign to this domain.            */
        /*****************************************************************/

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
        
        //**************************************************************/
        // CONFIGURATION OBJECT WAY
        //**************************************************************/

        /******************************************************************/
        /* Briefing:                                                      */ 
        /* The default database configured in datasource is "multitenant" */
        /* "client1" database is a tenant database asociate to a client1  */
        /*                                                                */
        /******************************************************************/

        /*
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
        */

        //**************************************************************/
        // DATASOURCE CREATION WAY
        //**************************************************************/

        /******************************************************************/
        /* Briefing:                                                      */ 
        /* The default database configured in datasource is "multitenant" */
        /* "client1" database is a tenant database asociate to a client1  */
        /*                                                                */
        /******************************************************************/

        /*
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
        */

        // A normal call to "multitenant" database with the same table
        // But this table is empty
        const test = await Client.find();
        return res.ok({
            client: clients,
            compare: test
        });
    }
};