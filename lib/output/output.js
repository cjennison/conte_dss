var config = require('../config');
var fs     = require('fs');
var mkdirp = require('mkdirp');
var uuid   = require('node-uuid');
var util   = require('util');
var mongodb= require('mongodb');
var database	 = require("../../lib/database");


function requestGraph(stepID, cb){
	var configuration = '';
	
	//Find the run in the database
	database.getRun(stepID, function(run){
		var returned_run = run[0];
		console.log(returned_run)		
		var config_url = config.server.ModelsDir + "/config/" + returned_run.step + "/graph.json"
		console.log(config_url);
		
		fs.readFile(config_url, 'utf8' ,function(err, data){
					if(err) throw err;
					
					
					configuration = JSON.parse(data);
					console.log(configuration)
					
					
					for(var i=0;i<configuration.graphTypes.length;i++){
						for(var j=0;j<configuration.graphTypes[i].series.length;j++){
						configuration.graphTypes[i].series[j].directory = returned_run.user + "/" + returned_run.step + "/" + returned_run.stepID + "/";
						}
					}
					
					
					
					
					cb(configuration)
				})
		
	});
	
	
	
}

function getAllGraphs(stepID,user, cb){
	var step_arr = [];
	var config_full = {graphTypes:[]};
	var youngest_step;
	database.getRun(stepID, function(run){
		youngest_step = run[0];
		step_arr.push(youngest_step);

		database.getRunParents(user, function(run_list){
			console.log(run_list);
			
			function findParents(id){
			           console.log("Looking for objects with parent of " + id)
			           	for(var i=0;i<run_list.length;i++){
			           		if(run_list[i].stepID == id){ //found run from dropdown
			           			console.log("Found teh run from the dropdown")
			           			for(var x = 0;x < run_list.length; x++){
			           				if(run_list[i].parent == run_list[x].stepID){
			           					step_arr.push(run_list[x]);
			           					findParents(run_list[x].stepID);
			           				}
			           			}
			           		}
			           	}
			           }
			           
			           
			           
			findParents(stepID);

			//We now have all of parentage graphs - now to read in and sort all of the configurations
			var num_steps = step_arr.length;
			var read_files = 0;

			console.log(step_arr);

			function readAndConfigure(step){
				var config_url = config.server.ModelsDir + "/config/" + step.step + "/graph.json";
				fs.readFile(config_url, 'utf8' ,function(err, data){
					if(err) throw err;
					
					
					var stepConfig = JSON.parse(data);
					console.log(stepConfig )
					console.log(step.step);
					
					for(var i=0;i<stepConfig.graphTypes.length;i++){
						for(var j=0;j<stepConfig.graphTypes[i].series.length;j++){
							stepConfig.graphTypes[i].series[j].directory = step.user + "/" + step.step + "/" + step.stepID + "/";
							
						}
						config_full.graphTypes.push(stepConfig.graphTypes[i]);
					}
					
					
					read_files++;
					if(read_files < num_steps){
						readAndConfigure(step_arr[read_files]);
					} else {
						//config_full.graphTypes.reverse();
						cb(config_full);
					}
					
					
					//cb(configuration)
				})

			}

			readAndConfigure(step_arr[read_files]);


		
		});
		
	})


	

}

function getBaseAndParent(user, stepID, cb){
	var step_arr = [];
	var youngest_step;
	database.getRun(stepID, function(run){
		youngest_step = run[0];
		step_arr.push(youngest_step);

		database.getRunParents(user, function(run_list){
			console.log(run_list.length);
			function findParents(id){
			           console.log("Looking for objects with parent of " + id)
			           	for(var i=0;i<run_list.length;i++){
			           		if(run_list[i].stepID == id){ //found run from dropdown
			           			console.log("Found teh run from the dropdown")
			           			for(var x = 0;x < run_list.length; x++){
			           				if(run_list[i].parent == run_list[x].stepID){
			           					step_arr.push(run_list[x]);
			           					findParents(run_list[x].stepID);
			           				}
			           			}
			           		}
			           	}
			           }
			           
			           
			           
			findParents(stepID);

			cb(step_arr);
		})
	});
	

}

exports.getBaseAndParent = getBaseAndParent;
exports.requestGraph = requestGraph;
exports.getAllGraphs= getAllGraphs;