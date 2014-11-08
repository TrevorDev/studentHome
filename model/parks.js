var database = require('./../lib/database');
var sequelize = require('sequelize');
var si = database.getSequelizeInstance();

var parks = si.define('parks',
	{
		Latitude: sequelize.FLOAT,
		Longitude: sequelize.FLOAT,
		ParkName: sequelize.STRING,
		SoccerFields: sequelize.STRING,
		HardBallDiamond: sequelize.INTEGER,
		BeachVolleyBall: sequelize.INTEGER,
		Address: sequelize.STRING,
		Area: sequelize.FLOAT,
		LeashFreeZoneArea: sequelize.INTEGER,
		Football_LIT_Irrigated: sequelize.INTEGER,
		TennisCourt: sequelize.INTEGER,
		BasketballFullCourt: sequelize.INTEGER,
		PlayEquipment: sequelize.INTEGER,
		SplashPad_Recirculation: sequelize.INTEGER,
		IceRink_Artificial: sequelize.INTEGER,
		SwimmingPool_Outdoor: sequelize.INTEGER,
		ShadeStructure: sequelize.INTEGER,
		WashroomBuilding: sequelize.INTEGER,
		Concession: sequelize.INTEGER,
		Trail_Asphalt: sequelize.INTEGER,
		AsphaltParking: sequelize.INTEGER,
		BikeRack: sequelize.INTEGER
	}, {
		classMethods: {

		},
		instanceMethods: {

		}
	}
)

module.exports = parks;