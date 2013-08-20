var config = require('../config');
var fs     = require('fs');
var mkdirp = require('mkdirp');
var uuid   = require('node-uuid');
var util   = require('util');
var spawn  = require('child_process').spawn;
var mongodb= require('mongodb');

// This table is used to store active runs. Each key is a run ID and
// each value is a table indicating the step and whether it is
// processing or it is complete.
var active_runs = {};
var currenRunNumber = 0;

// The executeRun function will execute a run for each of the
// provided steps.
function executeRun(user, spec) {
	console.log("----------------------------------------NEW RUN----------------------------------------------------------------------")
  currenRunNumber = 0;
  console.log('[executeRun] user invoked run');
  console.log('[executeRun] spec: ' + util.inspect(spec));
  var runID = prepareRunSequence(user, spec);
  console.log('[executeRun] sequence: ' + util.inspect(active_runs[runID]));

  return invokeSequence(runID);
}

function prepareRunSequence(user, spec) {
  // An array to hold the sequence of runs.
  var sequence = [];
  // The basin_id records the basin id found in the specs. Some specs have it
  // and others do not. So, for the moment we will just record one when we
  // find one. Perhaps this should be fixed in the message protocol?
  var basin_id = undefined;

  // Generate a new run id.
  var runID = uuid.v4();

  for (var step in spec) {
    // Record the basin id if it exists and we already did not record it.
    if (basin_id === undefined && spec[step].basin_id !== undefined) {
      basin_id = spec[step].basin_id;
    }
    
    var stepID = uuid.v4();
	console.log("SPEC")
	console.log(spec[step])
	
    var exec_step = {};
    exec_step.user               = user;
    exec_step.step               = step;
    exec_step.runID              = runID;
    exec_step.stepID			    = stepID;
    exec_step.alias				= spec[step].alias;
    exec_step.script             = spec[step].scriptName + '.R';
    exec_step.basinid            = basin_id;
    exec_step.settings           = spec[step];
    exec_step.settings.step      = step;
    exec_step.settings.basin_id  = basin_id;
    exec_step.settings.preceding = spec[step].preceding;
    exec_step.settings.runID     = runID;
    exec_step.settings.stepID    = stepID;
    exec_step.preceding          = spec[step].preceding;
    exec_step.existing			 = spec[step].exists;
    exec_step.output             = '';
    exec_step.status             = 'WORKING';
   
    console.log(exec_step.settings.stepID);
    
    console.log("CHECKING FOR PREVIOUSLY RUN stepS")
    if(exec_step.existing === "true"){
    	exec_step.stepID = spec[step].existing_step_id;
    	exec_step.settings.stepID = spec[step].existing_step_id;
    	exec_step.status = "DONE";
    	console.log(step.stepID);
    }
     sequence.push(exec_step);
    
  } //ends the loop of all steps in spec.
  
  
  // Save sequence in active runs table:
  active_runs[runID] = {
    rid  : runID,
    user : user,
    work : sequence
  };

  // Return the run ID:
  return runID;
}

function invokeSequence(runID) {
  // Mark the next model with the models directories that
  // preceded it. Not sure if this is the best place to put
  // this or not.

  // Get the sequence to run:
  var sequ      = active_runs[runID];
  // Get the next model that has not been executed:
  var nextModel = findNextModel(sequ.work, sequ.user.dir);
  if (nextModel !== undefined) {
  	markPreceding(runID);

    console.log('[invokeSequence] nextModel: ' +
                util.inspect(nextModel));
    // Generate the directory name for the step:
    var stepDir   = generateStepDir(sequ.user.dir, nextModel);
    var stepID    = "kuendkjwen";

    console.log('[invokeSequence] stepDir: ' + stepDir);
    

    	createStepDir(stepDir, function (error) {
      if (error) {
        console.log('[invokeSequence] Could not create step directory: ' + error);
      }
      else {
        // Write the settings file:
        writeSettings(stepDir, nextModel, function (error) {
          if (error) {
            console.log('[runModel] Could not write settings.json:' + error);
          }
          else {
            // Run the model.
            runModel(runID, nextModel, stepDir);
          }
        });
      }
    });
    
    
    
  }

  console.log('[invokeSequence] Run ' + runID + ' Complete.');

  // Return the run ID:
  return runID;
}

function runModel(runID, nextModel, stepDir) {
  // Record the step directory with the model to be executed.
  nextModel.step_dir = stepDir;
  console.log('[runModel] running model step ' + nextModel.step);
  console.log('[runModel] running script ' + nextModel.script);

  // Create the options object for invoking the model script.
  var opts = {
    // Run in the R models directory
    cwd : config.server.ModelsDir + '/r',
    // Pass along the current process environment to the forked process.
    env : process.env
  };

  // rargs are the arguments to be passed to the model as json. We must
  // pass the following important arguments:
  //
  // * `run_dir`   : this is the directory the model executed in.
  // * `basin_dir` : this is the directory containing the basin files.
  // * `data_dir`  : this is the directory to look for data files.
  // * `preceding` : this is an object for each of the preceding model runs
  //                 that this model run might depend on.
  var rargs = JSON.stringify({ run_dir   : stepDir,
                               basin_dir : config.server.BasinsDir,
                               data_dir  : config.server.DataDir,
                               preceding : nextModel.preceding
                             });

  // args are the arguments to the Rscript command:
  var script = config.server.ModelsDir + '/r/' + nextModel.script;
  var args   = [ script, rargs ];

  // Invoke the model:
  console.log('[runModel] invoking RScript: ' + script + ' with ' + rargs);
  var proc = spawn('Rscript', args, opts);

  proc.stdout.on('data', function (data) {
    console.log('[' + nextModel.script + '.stdout]' + data);
    nextModel.output += data;
  });

  proc.stderr.on('data', function (data) {
    console.log('[' + nextModel.script + '.stderr]' + data);
    nextModel.output += 'ERROR: ' + data;
  });

  proc.on('exit', function (code) {
    console.log('process completed for ' + nextModel.script);
    // When we are finished we invoke the next model in the sequence:
    if (code === 0) {
      // Mark the model as done.
      nextModel.status = 'DONE';
      
      addToUserTree(nextModel, runID);

      invokeSequence(runID);
    }
    else {
      nextModel.status    = 'FAILED';
      nextModel.exit_code = code;
      console.log("RUN FAILED ----------------------------- ")
      console.log(nextModel.url)
      
      //TODO: Open DB set step to faled
      
      //deleteFolderRecursive("/home/node.js/users/" + nextModel.url);
    }
  });

  console.log('[runModel] Returning');
}


//You'll be used someday :(
function deleteFolderRecursive(path) {
	console.log(path);
  if( fs.existsSync(path) ) {
  	console.log("I made it thus far")
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function findPreviousModel(work){
	console.log("FINDING PREVIOUS MODEL")
	console.log(work)
	var comp_models = 0
	for (var i = 0; i < work.length; i++){
		var w = work[i];
		if(w.status == "DONE"){
			comp_models++;
			console.log(comp_models);
		}
	}
	
	if(comp_models > 1){
		console.log(work[comp_models - 2].stepID);
		return work[comp_models - 2].stepID;
	} else {
		return "basin";
	}
	
	
  
}

function findNextModel(work, userdir) {
  // First, find the next model to run:
  var len  = work.length;
  for (var i = 0; i < len; i++) {
    var w = work[i];
    generateStepDir(userdir, work[i]);
    console.log('[findNextModel] w.status = ' + w.status);
    if (w.status === 'WORKING') {
      return w;
    } else {
    	
    }
  }
  return undefined;
}

function addToUserTree(nextModel, runID){
	var server = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('users', server, {}).open(function(error, client){
		if(error) throw error;
		console.log("CONNECTED")
		var collection = new mongodb.Collection(client, 'users');
		var sequ      = active_runs[runID];
		var parent = "basin";
		parent = findPreviousModel(sequ.work);
		/*
		if(currenRunNumber > 0){
			parent = active_runs[runID].work[currenRunNumber-1].stepID;
			console.log("I HAVE A PARTENT AND HER NAME IS: " + parent)
		} 
		*/
		
		//console.log("SENDING RUN INFORMATION TO THE USER: " + active_runs[runID].work[currenRunNumber].user.name)
		collection.insert({
			"username":nextModel.user.name,
			"runid":nextModel.runID, 
			"step":nextModel.step,
			"alias":nextModel.alias,
			"stepID":nextModel.stepID,
			"parent":parent, 
			"deleted":"false",
			"basinid":nextModel.basinid}, 
		
		{safe:true}, function(err){
				if(err) console.warn(err.message);
				else{
					console.log("SENDING RUN INFORMATION TO THE USER: " + nextModel.user)
					currenRunNumber++;
					console.log("SUCCESSFULLY PUSHED RUN");
				} 
			});
			
		})
	
}


function markPreceding(runID) {
  var sequ  = active_runs[runID];
  var next  = findNextModel(sequ.work);
  if (next !== undefined) {
    var dones = findCompletedModels(sequ.work);
    for (var i = 0; i < dones.length; i++) {
      var m = dones[i];
      var step_dir = m.step + '_dir';
      if(next.preceding[step_dir] == undefined){
      	// Record the step directory in the model's preceding map.
	      next.preceding[step_dir] = m.step_dir;
	      // Record the step directory in the model's settings.
	      next.settings.preceding[step_dir] = m.step_dir;
      }
      
    }
  }
}

function createStepDir(stepDir, cb) {
  console.log('[createStepDir] creating ' + stepDir);
  mkdirp(stepDir, cb);
}

function writeSettings(stepDir, nextModel, cb) {
  console.log('[writeSettings] writing ' + stepDir + 'settings.json');
  fs.writeFile(stepDir + 'settings.json',
               JSON.stringify(nextModel.settings) + '\n', cb);
}



function findLastModel(work, curRun){
	if(active_runs[runID].work.runID == undefined) return "basin";
	else return work[curRun - 1].runID;
}

function findCompletedModels(work) {
  var len = work.length;
  var completed = [];
  for (var i = 0; i < len; i++) {
    var w = work[i];
    if (w.status === 'DONE') {
      completed.push(w);
    }
  }
  return completed;
}

function generateStepDir(userDir, nextModel) {
  console.log('[generateStepDir] nextModel.step: ' + nextModel.step);
  console.log('[generateStepDir] userDir: ' + userDir);

  // Generate the name of the model execution directory:
  var mdir = nextModel.stepID; //TODO: Change to StepID
  var sdir = userDir + '/' + nextModel.step + '/' + mdir + '/';

  // Save the URL to the model execution directory:
  //   * The URL is the username/step/uuid-dir. This directory is
  //     exported by the server as a static directory. The front-end
  //     should be able to access files contained in that directory
  //     given this URL.
  nextModel.url = nextModel.user.name + '/' + nextModel.step + '/' + mdir;

  return sdir;
}

//// Status Checking Code ////

function checkRunStatus(runID) {
  var work = active_runs[runID].work;
  if (work) {
    var len = work.length;
    var ret = [];
    for (var i = 0; i < len; i++) {
      var w = work[i];
      ret.push({ status  : w.status,
                 url     : w.url,
                 step    : w.step,
                 basinid : w.basinid });
    }
    return JSON.stringify({ 'status' : 'OK',
                            'run'    : ret });
  }
  else {
    return JSON.stringify({ 'status'  : 'BAD',
                            'message' : 'Unknown runID ' + runID });
  }
}

/*
 * Method: getRunChildren
 * Description: Gets all of the parents from a given step through a specified runID.
 * Params:
 * 	runID:String The run id of the step
 * 	step:String The step of the run
 * 	username:String The username of the user 
 */
function getRunParents(stepID, step, user, cb){
	var assocRuns;
	var username = user.name;
	var matching_runs = new Array();
	
	console.log(username);
	
	//Stage One: Open up mongo database and get all of the runs associated with the run ID.
	var server = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('users', server, {safe:true}).open(function(error, client){
		if(error) throw error;
		console.log("CONNECTED")
		var collection = new mongodb.Collection(client, 'users');
		
		collection.find({"username":username}).toArray(function(err, docs){
			if(err) throw err;
			var docStr = JSON.stringify(docs);
			
			//console.log(JSON.parse(JSON.stringify(docs)));
			var json = JSON.parse(docStr);
			if(json[0] == undefined){
				cb("FAILURE")
				return;
			}
			//console.log(json[0])
			
			var runs = json;
			
			var arr = runs;
					var results = [];
					var idsSeen = {}, idSeenValue = {};
					for (var i = 0, len = arr.length, id; i < len; ++i) {
					    id = arr[i].stepID;
					    if (idsSeen[id] !== idSeenValue) {
					        results.push(arr[i]);
					        idsSeen[id] = idSeenValue;
					    }
					}
										
					runs = results;
			
			
			function findParents(id){
			           	console.log("Looking for objects with parent of " + id)
			           	for(var i=0;i<runs.length;i++){
			           		if(runs[i].stepID == id){ //found run from dropdown
			           			console.log("Found teh run from the dropdown")
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
			
			
			console.log(matching_runs);
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
		
		
			
		})
	

}

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


function getRunChildren(stepID, step, user, cb){
	var username = user.name;
	var server = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('users', server, {}).open(function(error, client){
		if(error) throw error;
		console.log("CONNECTED")
		var collection = new mongodb.Collection(client, 'users');
		
		
		collection.find({"username":username}, {limit:10}).toArray(function(err, docs){
			if(docs == ""){
				res.json({message:"user does not exist"})
			} 
			else {
				var docStr = JSON.stringify(docs);
				
				
				//JSON FIle has be retrieved from the Mongo Databsase
				var json = JSON.parse(docStr);
			
				
				if(json == undefined){
					res.json({message:"NO RUN INFO"})
				} else {
					var run_list = json;
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
	       			 
	       			
			        
					cb(child_set)
					
					
				}
				
				
			}
			
			
		})
	});
	
	
}


//// Tree Buliding Code EXPERIMENTAL ////

// var runTrees = {};


// function buildRunTree(user, basin_id) {
//   var tree = runTrees[user.name];

//   if (tree === undefined) {
//     tree = {};
//     tree.name     = '';
//     tree.basin_id = basin_id;
//     tree.step     = 'basin';
//     tree.children = [];
//     runTrees[user.name] = tree;
//   }

//   buildClimateTree(basin_id, tree);
// }

// function buildClimateTree(basin_id, tree) {
//   var climateDir = user.dir + '/climate';
//   fs.readdir(climateDir, function (err, files) {
//     var len = files.length;
//     for (var i = 0; i < len; i++) {
//       var settingsFile = climateDir + '/' + files[i] + '/settings.json';
//       fs.readFile(settingsFile, function (err, data) {
//         var settings = JSON.parse(data);
//         if (settings.basin_id === basin_id) {
//           var child = {};
//           child.name     = settings.alias;
//           child.step     = 'climate';
//           child.runID    = settings.runID;
//           child.children = [];
//           tree.children.push(child);
//         }
//       });
//     }
//   });
// }

exports.executeRun     = executeRun;
exports.checkRunStatus = checkRunStatus;
exports.getRunParents = getRunParents;
exports.getRunChildren = getRunChildren;
//exports.buildRunTree   = buildRunTree;
