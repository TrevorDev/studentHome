var database = require('./../lib/database');
var sequelize = require('sequelize');
var si = database.getSequelizeInstance();

var parks = si.define('parks',
	{
		Latitude: sequelize.FLOAT,
		Longitude: sequelize.FLOAT,
		Name: sequelize.STRING,
		SoccerFields: sequelize.STRING,
		BaseBallDiamond: sequelize.INTEGER,
		VolleyBallCourt: sequelize.INTEGER,
		Address: sequelize.STRING,
		Area: sequelize.FLOAT,
		LeashFree: sequelize.INTEGER,
		FootBallField: sequelize.INTEGER,
		TennisCourt: sequelize.INTEGER,
		BasketBallCourt: sequelize.INTEGER,
		JungleGym: sequelize.INTEGER,
		SplashPad: sequelize.INTEGER,
		IceRink: sequelize.INTEGER,
		SwimmingPool: sequelize.INTEGER,
		ShadeStructure: sequelize.INTEGER,
		Washroom: sequelize.INTEGER,
		Concession: sequelize.INTEGER,
		Trail: sequelize.INTEGER,
		Parking: sequelize.INTEGER,
		BikeRack: sequelize.INTEGER
	}, {
		classMethods: {

		},
		instanceMethods: {

		}
	}
)

module.exports = parks;