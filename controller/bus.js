var database = require('./../lib/database');
var map = require('./../lib/googleMaps');
var si = database.getSequelizeInstance();

exports.getBus = function*(){
	var address = this.params['number']+' '+this.params['street']
	var latLong = yield map.getLatLong(address);
	var dt = yield si.query("select *, " +
		" ( 3959 * acos( cos( radians("+latLong.lat+") ) " +
		" * cos( radians( busStops.latitude ) ) " +
		" * cos( radians( busStops.longitude ) - radians("+latLong.lng+") ) " +
		" + sin( radians("+latLong.lat+") ) " +
		" * sin( radians( busStops.latitude ) ) ) ) AS distance " +
		"from busStops where DT > 0 order by distance asc limit 1")
	var uc = yield si.query("select *, " +
		" ( 3959 * acos( cos( radians("+latLong.lat+") ) " +
		" * cos( radians( busStops.latitude ) ) " +
		" * cos( radians( busStops.longitude ) - radians("+latLong.lng+") ) " +
		" + sin( radians("+latLong.lat+") ) " +
		" * sin( radians( busStops.latitude ) ) ) ) AS distance " +
		"from busStops where UC > 0 order by distance asc limit 1")
	yield setNextTimes(dt[0])
	yield setNextTimes(uc[0])
	this.jsonResp(200, {dt: dt[0], uc: uc[0]})
}

var setNextTimes = function*(bus){
	var date = new Date();
	var dayType = "sunday"
	if(date.getDay() > 0 && date.getDay() < 6){
		dayType = "weekday"
	}else if(date.getDay() == 6){
		dayType = "saturday"
	}
	var times = yield si.query("select * from busTime where stop_id = \"" + bus.stop_id + "\" and day = \"" + dayType+"\"")
	bus.times = times;
}