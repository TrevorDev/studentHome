var request = require('co-request');

exports.getLatLong = function*(address){
	var result = yield request("https://maps.googleapis.com/maps/api/geocode/json?address="+address.replace(" ", "+")+"&key=AIzaSyA5jK4WtJObHJwEB0b6efS7FMlXiQxXv1Y");
	var obj = JSON.parse(result.body);
	return obj.results[0].geometry.location;
}

