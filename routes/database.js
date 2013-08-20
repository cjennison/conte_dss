var db = require("../lib/database")


exports.openDatabase = function(req, res){
	var database = db.openDatabase();
	res.json({"message":database})
}

exports.getDatabase = function(req, res){
	var database = db.breakTest(function(data){
		res.json({"response":data})
	})
}

exports.getAllRuns = function(req, res){
	var username = req.session.user.name;
	db.getAllRuns(username, function(data){
		res.json({"runs":data})
	})
}

exports.getBarrierSettings = function(req, res){
	var stepID = req.body.stepID;
console.log(stepID);
	db.getRun(stepID, function(run){
		console.log(run);
		var step = run[0];
		res.json({step:step});
	});
}

exports.getUpdate = function(req, res){
	var runArray = req.body.run_list;
	res.json({"list":runArray});
}

exports.checkUser = function(req, res){
	var username = req.session.user.name;
	db.checkUser(username, function(data){
		res.json({"runs":data});
	})
}

exports.updateUserTime = function(req, res){
	if(req.session.user == undefined){res.json({'message':"no user"}); return;}
	var username = req.session.user.name;
	var time = req.body.time;
	
	req.session.time = time;
	console.log(time);
	
	//var time = req.body.time;
	db.updateTime(username, time, function(){
		res.json({'message':"updated time"})
	});
}

exports.getMissedRuns = function(req, res){
	if(req.session.user == undefined){res.json({'missed_runs':"FAILED"}); return;}
	var username = req.session.user.name;
	
	console.log("GETTING OLD RUNS")
	console.log(username);
	db.getMissedRuns(username, function(data){
		res.json({'missed_runs':data})
	})
	
}
