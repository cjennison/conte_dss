var users = require('../lib/users');
var fs = require('fs');
var RScriptDir = require('../config/streams.json').ModelsDir +'/r';

var runs = require('../lib/models');
exports.exec = function (req, res) {
	var user  = req.session.user;
  var spec  = req.body.webInfo;
  var runID = runs.executeRun(user, spec);
  res.json({ 'runID' : runID });
};

exports.check = function (req, res) {
  var runID = req.body.runID;
  var status = runs.checkRunStatus(runID, function(resp){
  	 res.json(resp);
  })
 
};


exports.startExecution = function(req, res){
	var user = req.session.user;
	var time = req.session.time;
	var spec = req.body.webInfo;
	var step = runs.initExecution(user, spec, time);
	res.json({'stepID':step.stepID, 'alias':step.alias})
}




//Routes for getting all of a steps run children
/*
 *	Author: Chris Jennison
 * 
 *  Params:
 * runId:String - The run id of the specified run.
 * step:String - The step of the current runID.
 * 
 * ie: $.post('/get-run-children', {runId:9283749283, step:"land"});
 */
exports.getRunParents = function(req, res){
	console.log(req.body);
	//Req Params
	var stepID = req.body.stepId,
		step = req.body.step,
		user = req.session.user;
		
	if(!stepID || !step || !user){
		res.json({message:"Missing Input: runID or step not specified"})
	} else {
		var associatedRuns = runs.getRunParents(stepID, step, user, function(returned_runs){
			console.log("ALL DONE WOOT");
			res.json({message:returned_runs})
		});
		
		
	}
		
		
}


exports.getRunChildren = function(req, res){
	console.log(req.body);
	var stepID = req.body.stepId,
		step = req.body.step,
		user = req.session.user;
		
	if(!stepID || !step || !user){
		res.json({message:"Missing Input: runID or step not specified"})
	} else {
		var childRuns = runs.getRunChildren(stepID, step, user, function(returned_runs){
			console.log("ALL DONE WOOT");
			res.json(returned_runs)
		});
		
		
	}
		
}


