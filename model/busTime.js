var database = require('./../lib/database');
var sequelize = require('sequelize');
var si = database.getSequelizeInstance();

var busTime = si.define('busTime',
    {
        stop_id: sequelize.STRING,
        day: sequelize.STRING,
        time: sequelize.STRING,
        
    }, {
        classMethods: {

        },
        instanceMethods: {

        }
    }
)

module.exports = busTime;