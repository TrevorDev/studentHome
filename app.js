var config = require('./lib/config')
var database = require('./lib/database')
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
app.get('/dashboard', defaultPageLoad('dashboard'))
//EXAMPLE http://localhost:3000/api/garbage/5/ZESS%20CRT
app.get('/api/garbage/:number/:street', function*(){
	try{
		var result = yield request({
			url: 'https://creator.zoho.com/935785/cartlookupforfall2013/view-perma/searchResults/e?number='+this.params['number']+'&name='+this.params['street'].replace(" ", "%20"),
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Cache-Control': 'max-age=0',
				'Connection': 'keep-alive',
				'Cookie': 'b440f375cc=ce309362867f6769a4fa9b1d65cbbb7e; zcccn=5b472507-d4cb-4d3b-b1f5-6abfa35d0d11; JSESSIONID=2AF4EDB24352E60DC6E879BCC2E6E9B2; __utmt=1; __utma=168905406.1264352842.1414532910.1414532910.1414542292.2; __utmb=168905406.1.10.1414542292; __utmc=168905406; __utmz=168905406.1414532910.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)',
				'Host': 'creator.zoho.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
			}
		});
		console.log(this.params)
		var week = result.body.match(/View (.*?) collection schedule/)[1]
		var day = result.body.match(/color:black\"> (.*?)<\/span>\n            <p>  <span style=\"font-size:1/)[1]
		var type = result.body.match(/Collection type: <span  style=\"font-weight:bold; font-size:14px; color:black\">                                                                                \n\n(.*?)                                                                                                                                                                                                                                                                                                                                    \n\n<\/span>\n/)[1]
		this.jsonResp(200, {
			week: week,
			day: day,
			type: type
		})
	}catch(e){
		this.jsonResp(200, {
			week: "address not found",
			day: "address not found",
			type: "address not found"
		})
	}
	
})
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
