var database = require('./../lib/database');
var map = require('./../lib/googleMaps');
var si = database.getSequelizeInstance();

exports.getBus = function*(){
	var address = this.params['number']+' '+this.params['street']
	var latLong = yield map.getLatLong(address + ", Guelph Ontario");
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
	var routeName = dt[0].stop_id.split("-")[0].replace(/route/i, "")
	dt[0].routeName = routeName
	yield setNextTimes(uc[0])
	routeName = uc[0].stop_id.split("-")[0].replace(/route/gi, "")

	uc[0].routeName = routeName
	this.jsonResp(200, {latLong: latLong, dt: dt[0], uc: uc[0]})
}

var setNextTimes = function*(bus){
	var date = new Date();
	var dayType = "sunday"
	if(date.getDay() > 0 && date.getDay() < 6){
		dayType = "weekday"
	}else if(date.getDay() == 6){
		dayType = "saturday"
	}

	var x = new Date()
	var currentTime = x.getHours()+":"+x.getMinutes()+":"+x.getSeconds()


	var times = yield si.query("select *, TIMEDIFF(time, \""+currentTime+"\") as timeDiff from busTime where stop_id = \"" + bus.stop_id + "\" and day = \"" + dayType+"\" having timeDiff > 0 order by timeDiff ASC limit 3")
	

	while(times.length == 0){
		if(dayType == "saturday"){
			dayType = "sunday"
		}else if(dayType == "sunday"){
			dayType = "weekday"
		}
		times = yield si.query("select * from busTime where stop_id = \"" + bus.stop_id + "\" and day = \"" + dayType+"\" limit 3")
		for(var i = 0;i< times.length;i++){
			times[i].timeDiff = "Over a day"
		}
		if(dayType == "weekday"){
			break;
		}
	}



	bus.times = times;
}