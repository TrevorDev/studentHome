exports.getPark = function*(){
	this.jsonResp(200, {
			results: [{
				name: "worst park",
				bball: "yes"
			},
			{
				name: "worst school",
				bball: "blah"
			}]
		})
}