var request = require('co-request');

Date.prototype.getWeek = function() { 
    var determinedate = new Date(); 
    determinedate.setFullYear(this.getFullYear(), this.getMonth(), this.getDate()); 
    var D = determinedate.getDay(); 
    if(D == 0) D = 7; 
    determinedate.setDate(determinedate.getDate() + (4 - D)); 
    var YN = determinedate.getFullYear(); 
    var ZBDoCY = Math.floor((determinedate.getTime() - new Date(YN, 0, 1, -6)) / 86400000); 
    var WN = 1 + Math.floor(ZBDoCY / 7); 
    return WN; 
}


exports.getGarbageDay = function*(){
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
		var curDate = new Date();
		
		//console.log(this.params)
		var week = result.body.match(/View (.*?) collection schedule/)[1]
		var day = result.body.match(/color:black\"> (.*?)<\/span>\n            <p>  <span style=\"font-size:1/)[1]
		var type = result.body.match(/Collection type: <span  style=\"font-weight:bold; font-size:14px; color:black\">                                                                                \n\n(.*?)                                                                                                                                                                                                                                                                                                                                    \n\n<\/span>\n/)[1]
		this.jsonResp(200, {
			week: week,
			day: day,
			type: type,
			recycleDay: week == "Week B" ? (curDate.getWeek() % 2 == 0 ? true: false) : (curDate.getWeek() % 2 == 1 ? true: false)
		})
	}catch(e){
		this.jsonResp(200, {
			week: "address not found",
			day: "address not found",
			type: "address not found",
			recycleDay: "address not found"
		})
	}
	
}