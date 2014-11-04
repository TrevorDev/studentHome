exports.getBus = function*(){
	this.jsonResp(200, {
			results: [{
				name: "worst bus",
				bball: "yes"
			},
			{
				name: "worst bus 2",
				bball: "blah"
			}]
		})
}