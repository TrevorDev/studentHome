var database = require('./../lib/database');
var sequelize = require('sequelize');
var si = database.getSequelizeInstance();

var busInfo = si.define('busInfo',
	{
		StopID: sequelize.STRING,
		StopCode: sequelize.STRING,
		Name: sequelize.STRING,
		Latitude: sequelize.FLOAT,
		Longitude: sequelize.FLOAT,
		Longitude: sequelize.FLOAT,
		Address: sequelize.STRING,
		GoesToSchool: sequelize.STRING,
		GoesDowntown: sequelize.STRING,
		DepatureTimes: sequelize.DATE,
		Routes: sequelize.STRING,
		Calendar: sequelize.STRING,
		TripID: sequelize.STRING,
		RouteID: sequelize.STRING,
		RouteLongName: sequelize.STRING
	}, {
		classMethods: {

		},
		instanceMethods: {

		}
	}
)

module.exports = busInfo;