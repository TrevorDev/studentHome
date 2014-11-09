var database = require('./../lib/database');
var sequelize = require('sequelize');
var si = database.getSequelizeInstance();

var busStops = si.define('busStops',
	{
		stop_id: sequelize.STRING,
		stop_name: sequelize.STRING,
		latitude: sequelize.FLOAT,
		longitude: sequelize.FLOAT,
		DT: sequelize.INTEGER,
		UC: sequelize.INTEGER,
	}, {
		classMethods: {

		},
		instanceMethods: {

		}
	}
)

module.exports = busStops;