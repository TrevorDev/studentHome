var config = require('./lib/config')
var database = require('./lib/database')
var maps = require('./lib/googleMaps')
var logger = require('koa-logger')
var router = require('koa-router')
var serve = require('koa-static')
var session = require('koa-session')
var views = require('co-views')
var parse = require('co-body')
var jsonResp = require('koa-json-response')
var koa = require('koa')
var swig = require('swig')
var https = require('https')
var http = require('http')
var request = require('co-request');
var fs = require('fs')
var app = koa()
var garbage = require("./controller/garbage")
var park = require("./controller/park")
var bus = require("./controller/bus")

// var co = require("co")
// co(function*(){
// 	console.log("hit")
// 	yield maps.getLatLong("31 legacy dr");

// })()

//Add database
si = database.getSequelizeInstance()
//si.sync()

//var userCtrl = require('./controller/user')

//REMOVE IN PRODUCTION??
swig.setDefaults(config.templateOptions)

//ROUTES
app.keys = [config.sessionSecret]
app.use(session())
app.use(jsonResp())
app.use(router(app))

//PAGE ROUTES
app.get('/', defaultPageLoad('index'))
//EXAMPLE http://localhost:3000/api/garbage/5/ZESS%20CRT
app.get('/api/garbage/:number/:street', garbage.getGarbageDay)
app.get('/api/park/:number/:street', park.getPark)
app.get('/api/bus/:number/:street', bus.getBus)
app.get(/\/public\/*/, serve('.'))

//API ROUTES
//app.get('/testUser', userCtrl.getUsers)

//PAGE HANDLERS
function defaultPageLoad(pageName, requiresLogin) {
	return function *(){
		/*if(requiresLogin===true && !sessionHelper.isLoggedIn(this.session)){
			this.redirect('/login')
			return
		}*/

		var temp = {};
		this.body = yield render(pageName, temp)
	}
}

function render(page, template){
	return views(__dirname + '/view', config.templateOptions)(page, template)
}

var server = http.createServer(app.callback())

//SOCKETIO
// var io = require('socket.io').listen(server);
// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });

server.listen(config.appPort);
console.log('Started ----------------------------------------------'+config.appPort)
