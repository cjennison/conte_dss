//Import all required packages
var config = require('../config');
var fs     = require('fs');
var mkdirp = require('mkdirp');
var uuid   = require('node-uuid');
var util   = require('util');
var spawn  = require('child_process').spawn;
var mongodb= require('mongodb');
var step_class   = require('./step');
var database	 = require("../../lib/database");
var tools = require('../tools');

//If the server is on standby
var onStandby = true;
var firstLoadup = true;

//Sets the server to constantly look over the database every 3000ms(3 seconds)
function setStandby(){
	
		setTimeout(function(){
			//if(onStandby){
				//Check database for any queued runs
				console.log("Checking DB for Runs")
				checkRuns();
				onStandby = false;
			//}
			setStandby();

		},3000)
	
}

/**
 * function:checkRuns
 * description: Checks the database for any runs that qualify to be executed.	
 */
function checkRuns(){
	
	//Get queued runs from the database.
	database.getQueuedRuns(firstLoadup, function(all, queued){
		firstLoadup = false;
		var all_runs = all;
		var que_list = queued;
		
		if(que_list.length >= 1){
				//If there are runs available to be executed
				for(var i = 0;i < que_list.length; i++){
					//Loop through runs for the parent
					if(que_list[i].parent == "basin"){
						//Doesn't have a parent - can run
						runStep(que_list[i]);
					} else {
						for(var q = 0;q < all_runs.length; q++){
							if(all_runs[q].stepID == que_list[i].parent){
								//Check for completion
								if(all_runs[q].status == "COMPLETED"){
									//parent is complete - can run
									runStep(que_list[i]);
								} else if (all_runs[q].status == "FAILED" || all_runs[q].status == "CANCELLED" ){
									//parent has failed or never initiated - destroy
									database.setStatus(que_list[i], "CANCELLED", function(){}, "END");
								}
							}
						}
					}
				}
				
				
			} else {
				//No queued runs
				onStandby = true;
			}
	})
	
	
	
}


/**
 * function:runStepteps
 * step - The step object from the database to be executed
 * 
 * description: Begins the process of running any given step in the database
 */
function runStep(step){
	//console.log(step.skipped);
	//console.log(step);
	
	console.log("RUNNING THE STEP: " + step.stepID);
	database.setStatus(step, "EXECUTED", function(){
		//Create Step Directory
		onStandby = true;

		createStepDir(step.url, function (error) {
	      if (error) {
	        console.log('[invokeSequence] Could not create step directory: ' + error);
	      }
	      else {
	        // Write the settings file:
	        writeSettings(step.url, step, function (error) {
	          if (error) {
	            console.log('[runModel] Could not write settings.json:' + error);
	          }
	          else {
	            // Run the model.
	            if(step.skipped == 'true'){
					console.log("I HAVE BEEN SKIPPED");
			    	database.setStatus(step, "COMPLETED", function(){}, "END")
			
					return;
				}
	            runModel(step.stepID, step, step.url);
	          }
	        });
	      }
	    });
	}, "START"); //set step in db to executed
	
	
	
}

/**
 * function:runStepteps
 * step - The step object from the database to be executed
 * 
 * description: Begins the process of running any given step in the database
 */
function runModel(stepID, step, stepDir) {
  // Record the step directory with the model to be executed.
  step.step_dir = stepDir;
  step.output = "";
  console.log('[runModel] running model step ' + step.step);
  console.log('[runModel] running script ' + step.script);

  // Create the options object for invoking the model script.
  var opts = {
    // Run in the R models directory
    cwd : config.server.ModelsDir + '/r/' + step.step + "/",
    // Pass along the current process environment to the forked process.
    env : process.env
  };

console.log("[cwd]: " + config.server.ModelsDir + '/r/' + step.step + "/");


  // rargs are the arguments to be passed to the model as json. We must
  // pass the following important arguments:
  //
  // * `run_dir`   : this is the directory the model executed in.
  // * `run_base_dir`   : this is the directory the model executed in.
  // * `basin_dir` : this is the directory containing the basin files.
  // * `data_dir`  : this is the directory to look for data files.
  // * `preceding` : this is an object for each of the preceding model runs
  //                 that this model run might depend on.
  var rargs = JSON.stringify({ run_dir   : stepDir,
				   run_base_dir : config.server.UsersDir + "/" + step.user,
                               basin_dir : config.server.BasinsDir,
                               data_dir  : config.server.DataDir,
				   stepID    : stepID,
                               preceding : step.preceding
                             });
console.log("[rargs]: " + config.server.UsersDir + "/" + step.user );
console.log("[rargs]: " + step.preceding );

  // args are the arguments to the Rscript command:
  var script = config.server.ModelsDir + '/r/' + step.step + "/" + step.script;
  var args   = [ script, rargs ];

  // Invoke the model:
  console.log('[runModel] invoking RScript: ' + script + ' with ' + rargs);
  var proc = spawn('Rscript', args, opts);

  proc.stdout.on('data', function (data) {
    console.log('[' + step.script + '.stdout]' + data);
    step.output += data;
  });

  proc.stderr.on('data', function (data) {
    console.log('[' + step.script + '.stderr]' + data);
    step.output += 'ERROR: ' + data;
  });

  proc.on('exit', function (code) {
    console.log('process completed for ' + step.script);
	console.log("THE CODE FOR THIS SPAWN IS: " + code);
    if (code === 0) {
    	
      //DONE
     database.setStatus(step, "COMPLETED", function(){}, "END")
		tools.zipFile(step);
    }
    else {
      //FAILED
      database.setStatus(step, "FAILED", function(){}, "END")
      
      //deleteFolderRecursive("/home/node.js/users/" + step.url);
    }
  });

}

/**
 * function: createStepDir
 * stepDir - Directory of the step
 * cb - callback function
 * 
 * description: Creates the step directory
 */
function createStepDir(stepDir, cb) {
  console.log('[createStepDir] creating ' + stepDir);
  mkdirp(stepDir, cb);
}

/**
 * function: writeSettings
 * stepDir - Directory of the step
 * step - step object
 * cb - callback function
 * 
 * description: Writes the settings file into the step's directory
 */
function writeSettings(stepDir, step, cb) {
  console.log('[writeSettings] writing ' + stepDir + 'settings.json');
  fs.writeFile(stepDir + 'settings.json',
               JSON.stringify(step.settings) + '\n', cb);
}




/**
 * function: initExecution
 * user - user object
 * spec - specification from the client
 * 
 * description: Initializes creating the step object for the database
 */
function initExecution(user, spec, time){
	console.log("[initExecution] Adding New Steps")
	console.log("[initExecution] spec: " + util.inspect(spec));
	var stepID = addSteps(user, spec, time);
	
	return stepID; //This is sent back to the client for status checking
}



/**
 * function: addSteps
 * user - user object
 * spec - specification from the client
 * 
 * description: Prepares and adds all steps into objects and writes them when required
 */
function addSteps(user, spec, time){
	
	
	if(user == undefined){return;}
	
	var step_sequence = [];
	var basin_id = undefined;
	
	var parent_stepID = "basin";
	
	for(var step = 0; step < spec.length;step++) {
		
		 // Record the basin id if it exists and we already did not record it.
	    if (basin_id === undefined && spec[step].basin_id !== undefined) {
	      basin_id = spec[step].basin_id;
	    }
		
		//The step already exists in the database
		if(spec[step].existing_step_id){
			//Mark the step id of the existing model to potentially be used by the preceding steps
			parent_stepID = spec[step].existing_step_id;
			var existing_step = {};
				existing_step.user = user.name;
				existing_step.stepID = spec[step].existing_step_id;
				existing_step.step = spec[step].step;
				existing_step.exists = true;
				existing_step.base_url = user.dir + "/";
			
			//Push the old step to the sequence for reference
			step_sequence.push(existing_step);
			
		} else {
			//The step does not exist in the database, add additional information
			var stepID = uuid.v4(); //create step id
			spec[step].stepID = stepID;
			spec[step].user   = user.name;
			spec[step].basin_id = basin_id;
			//spec[step].skipped
			spec[step].step = spec[step].step;;
			spec[step].parent = parent_stepID;
spec[step].base_url = user.dir + "/";
			
			//Init new step class
			var new_step = new step_class.Step(spec[step]);
			
			//Set parent id to new step id for following steps
			parent_stepID = spec[step].stepID;
			
			//Push the new step to the step_sequence
			step_sequence.push(new_step);
			//console.log(new_step);
			
		}
	}
	
	//Generate StepIDs for all steps
	for(var i = 0; i < step_sequence.length;i++){
			step_sequence[i].local_url = step_sequence[i].user + '/' + step_sequence[i].step + '/' + step_sequence[i].stepID + '/'; //testuser1/climate/oewidowed
			step_sequence[i].url = generateStepDir(user.dir, step_sequence[i]);  //home/node.js/users/testuser1/
			step_sequence[i].base_url = user.dir + "/";
	}
	
	//Mark preceding directories for settings file
	step_sequence = markPreceding(step_sequence)
				//console.log(step_sequence)

	for(var k = 0;k < step_sequence.length;k++){
		if(step_sequence[k].exists){ }
		else {
			//Add new steps to the database
			database.addStepToDatabase(step_sequence[k])
		}
	}
	
	
	
	
	//Sent back to the client for status searching
	var ret_object = {
		stepID: step_sequence[step_sequence.length - 1].stepID, 
		alias: step_sequence[step_sequence.length - 1].alias,
		scriptName: step_sequence[step_sequence.length - 1].script,
		basin_id:step_sequence[step_sequence.length - 1].basin_id

	}
	
	return ret_object;
	
}

/**
 * function: getTime
 * 
 * description: Gets the current time stamp of the local time
 */
function getTime(){
	var d = new Date();
	return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " - " + d.getHours() + ":" + d.getMinutes();
}

/**
 * function: markPreceding
 * seq The step sequence array
 * 
 * description: Gets the current time stamp of the local time
 * Populates settings.json for R
 * 
 */
function markPreceding(seq){
	for(var i = 0;i < seq.length;i++){
		if(seq[i].exists){ }
		else {
			for(var k = 0; k < seq.length; k++){
				var step_dir = seq[k].step;
				seq[i].preceding[step_dir] = seq[k].stepID;
				seq[i].settings.preceding[step_dir] = seq[k].stepID;
	
			}
		}
		
	}
	
	return seq;
}

/**
 * function: generateStepDir
 * userDir directory of the current 
 * step object of the current step
 * 
 * description: Generates a step directory for the given step and user
 */
function generateStepDir(userDir, step) {
  console.log('[generateStepDir] step.step: ' + step.step);
  console.log('[generateStepDir] userDir: ' + userDir);

  // Generate the name of the model execution directory:
  var mdir = step.stepID; //TODO: Change to StepID
  var sdir = userDir + '/' + step.step + '/' + mdir + '/';

  // Save the URL to the model execution directory:
  //   * The URL is the username/step/uuid-dir. This directory is
  //     exported by the server as a static directory. The front-end
  //     should be able to access files contained in that directory
  //     given this URL.
 

  return sdir;
}

/**
 * function: checkRunStatus
 * _stepID ID of the step
 * cb Callback function
 * 
 * description: Generates a step directory for the given step and user
 */
function checkRunStatus(_stepID, cb) {
	database.getStepStatus(_stepID, function(data){
		cb(data)
	})
	
}


/*
 * Method: getRunChildren
 * Description: Gets all of the parents from a given step through a specified runID.
 * Params:
 * 	runID The run id of the step
 * 	step:String The step of the run
 * 	username:String The username of the user 
 */
function getRunParents(stepID, step, user, cb){
	var assocRuns;
	if(user == undefined){return;}
	var username = user.name;
	var matching_runs = new Array();

	//Stage One: Open up mongo database and get all of the runs associated with the run ID.
	database.getRunParents(user, function(data){
		if(data[0] == undefined){
				cb("FAILURE")
				return;
			}
			//console.log(json[0])
			
			var runs = data;
			
			function findParents(id){
			           	//console.log("Looking for objects with parent of " + id)
			           	for(var i=0;i<runs.length;i++){
			           		if(runs[i].stepID == id){ //found run from dropdown
			           			//console.log("Found teh run from the dropdown")
			           			for(var x = 0;x < runs.length; x++){
			           				if(runs[i].parent == runs[x].stepID){
			           					matching_runs.push(runs[x]);
			           					findParents(runs[x].stepID);
			           				}
			           			}
			           		}
			           	}
			           }
			           
			           
			           
			findParents(stepID);
			
			
			//console.log(matching_runs);
			if(matching_runs.length < 1){
				return assocRuns = ["NO RUNS"];
			}
			
			
			assocRuns = new Array();
			var run_index = 0;
			var reader = readSettingsFile('/home/node.js/users/' + username + '/' + matching_runs[run_index].step + '/' + matching_runs[run_index].stepID + '/settings.json')
			var readerInterval = setInterval(function(){
				console.log(reader);
				if(reader.ready == false){
					
				}else {
					
					assocRuns.push(reader.information);
					run_index++;
					
					if(run_index >= matching_runs.length){
						clearInterval(readerInterval);
						cb(assocRuns);
						return;
					}
					reader = readSettingsFile(user.dir + '/' + matching_runs[run_index].step + '/' + matching_runs[run_index].stepID + '/settings.json')

				}
			},100)
			
			
			
		
	})
			
		
			
	
	

}
/*
 * Method: readSettingsFile
 * Description: reads and returns data from the settings file
 * Params:
 * 	url: Url of the settings file to be read
 */
function readSettingsFile(url){
	var state = {ready:true, information:{}};
	fs.readFile(url, {encoding:"utf-8"},function(err, data){
					if(err) throw err;
					var run_data = JSON.parse(data);
					state.information = run_data;
					state.ready = true;
					return state;
				})
		state.ready = false;
		return state;
}

/*
 * Method: getRunChildren
 * Description: gets all children of a given run
 * Params:
 * 	stepID stepID of the parent step
 * 	step step type
 * 	user user object
 * 	cb callback function
 */
function getRunChildren(stepID, step, user, cb){
	var username = user.name;
	
		database.getRunChildren(user, function(data){
			var run_list = data;
					
					
					var child_set = {
						climate:[],
						land:[],
						flow:[],
						streamtemp:[],
						population:[]
					}
					
					function findChildren(id){
			           	console.log("Looking for objects with parent of " + id)
			           	for(var i=0;i<run_list.length;i++){
			           		if(run_list[i].parent == id){
			           			child_set[run_list[i].step].push(username + "/" + run_list[i].step + "/" + run_list[i].stepID + "/settings.json"); //TODO: Replace with Step ID
			           			findChildren(run_list[i].stepID)
			           			
			           		}
			           	}
			           }
	        		
	       			findChildren(stepID);
	       			 console.log(child_set);
	       			 
	       			
			       
					var arr = run_list;
					var results = [];
					var idsSeen = {}, idSeenValue = {};
					for (var i = 0, len = arr.length, id; i < len; ++i) {
					    id = arr[i].stepID;
					    if (idsSeen[id] !== idSeenValue) {
					        results.push(arr[i]);
					        idsSeen[id] = idSeenValue;
					    }
					}
										
					run_list = results;
					
					
					cb(child_set)
		});

	
}


exports.checkRunStatus = checkRunStatus;
exports.initExecution = initExecution;
exports.setStandby = setStandby;
exports.getRunParents = getRunParents;
exports.getRunChildren = getRunChildren;






