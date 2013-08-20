var users = require('../lib/users');
var fs     = require('fs');
var output = require('../lib/output');
var db     = require('../lib/database');


exports.requestGraph = function(req, res){
	var username = req.session.user.name,
		stepID   = req.body.stepID;
		
	console.log("REQUESTING GRAPH")
		
	output.requestGraph(stepID, function(result){
		res.json({config:result});
	});
}

exports.getStepInfo = function(req, res){
	var username = req.session.user.name,
		stepID = req.body.stepID;
	
	db.getRun(stepID, function(result){
		res.json({data:result});
	})

	
}

exports.getBaseAndParent = function(req, res){
	var stepID = req.body.stepID,
		username = req.session.user;

	output.getBaseAndParent(username, stepID, function(data){
		res.json({message:data});
	})
}


exports.getAllGraphsOfStep = function(req, res){
	var user = req.session.user,
		stepID = req.body.stepID;
	
	output.getAllGraphs(stepID, user, function(result){
		res.json({config:result});
	});

	
}