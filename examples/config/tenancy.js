module.exports.multitenancy = function(req){
    const Tenants = sails.models.tenants;
    return new Promise(async (resolve, reject) => {
        const datasource = await Tenants.findOne({
            identity: req.hostname
        });
        resolve(datasource);
    });
}