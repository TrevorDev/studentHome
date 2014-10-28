var database = require('./../lib/database');
var sequelize = require('sequelize');
var si = database.getSequelizeInstance();

var waste = si.define('waste',
	{
		DayOfWeek: sequelize.INTEGER,
		Schedule: sequelize.STRING,
		Location: sequelize.STRING

	}, {
		classMethods: {

		},
		instanceMethods: {

		}
	}
)

module.exports = waste;