var database = require('./../lib/database');
var map = require('./../lib/googleMaps');
var si = database.getSequelizeInstance();

exports.getPark = function*(){
	var address = this.params['number']+' '+this.params['street']
	var latLong = yield map.getLatLong(address);
	//console.log(latLong)
	var parks = yield si.query("select *, " +
		" ( 3959 * acos( cos( radians("+latLong.lat+") ) " +
		" * cos( radians( parks.Latitude ) ) " +
		" * cos( radians( parks.Longitude ) - radians("+latLong.lng+") ) " +
		" + sin( radians("+latLong.lat+") ) " +
		" * sin( radians( parks.Latitude ) ) ) ) AS distance " +
		"from parks order by distance asc limit 3")
	this.jsonResp(200, parks)
}