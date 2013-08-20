//required packages
var mongodb= require('mongodb');

//Database and server informaton
var db = null,
	userdb = null,
	userdb_client = null,
	userserver = null,
	server = null,
	db_client = null; 

//Opens the database
function openDatabase(){
	
	server = new mongodb.Server("127.0.0.1", 27017, {safe:false});
	userserver = new mongodb.Server("127.0.0.1", 27017, {safe:false});
	db = new mongodb.Db('users', server, {}).open(function(err, client){
		db_client = client;
	});
	userdb = new mongodb.Db('user_base', userserver, {}).open(function(err, client){
		userdb_client = client;
	});
	
	return "I'm opening the database"
}


//Testing method for making multiple database connections
function breakTest(cb){
	
		var collection = new mongodb.Collection(db_client, 'users');
		collection.find().toArray(function(err, docs){
			cb(JSON.stringify(docs));
		})	
}


function getAllRuns(user, cb)
{
	var collection = new mongodb.Collection(db_client, 'users');
		collection.find({"user":user}).toArray(function(err, docs){
			cb(JSON.parse(JSON.stringify(docs)));
		})	
}

//Gets all queued runs from the database, sends cb(); on completion
function getQueuedRuns(startup, cb){
	var all_runs = [];
	var queued_runs = [];
	
		var collection = new mongodb.Collection(db_client, 'users');

		collection.find().toArray(function(err, docs){
			all_runs = JSON.parse(JSON.stringify(docs));
			
			for(var i = 0;i < all_runs.length;i++){
				if(startup){
					if(all_runs[i].status == "QUEUED" || all_runs[i].status == "EXECUTED"){
						queued_runs.push(all_runs[i]);
					}
				} else {
					if(all_runs[i].status == "QUEUED"){
						queued_runs.push(all_runs[i]);
					}
				}
					
			}
			
			cb(all_runs, queued_runs);

		});
	
}

//Sets the status of the given step in the database
function setStatus(step, new_status, cb, time_type){
		var type;
		if(time_type != null){
			
		} else {
			return;
		}
		var time;
		var usercollection = new mongodb.Collection(userdb_client, 'user_base');
		usercollection.find({"user":step.user}).toArray(function(err, docs){
			var user = JSON.parse(JSON.stringify(docs));
			time = user[0].last_activity;
			console.log(user);
			
			var collection = new mongodb.Collection(db_client, 'users');
			
			switch (time_type){
				case "START":
					collection.update({stepID: step.stepID}, {$set: {
						status: new_status,
						start_time:time,
						
						}},{safe:true}, function(err) {
			       	 	if (err) console.warn(err.message);
			        	else {
			        		cb();
			       		 }
			        });
					break;
				case "END":
					collection.update({stepID: step.stepID}, {$set: {
						status: new_status,
						resolved_time:time,
						
						}},{safe:true}, function(err) {
			       	 	if (err) console.warn(err.message);
			        	else {
			        		cb();
			       		 }
			        });
					break;
			}
			
			
		})
}

/**
 * function: addStepToDatabase
 * step - step object
 * 
 * description: Adds the selected run to the database
 */
function addStepToDatabase(step, override_status){
	
		var time;
		var status = "QUEUED";
		console.log("OVER:" + override_status);
			if(override_status == 'true'){
				status = "SKIPPED";
			}
		var usercollection = new mongodb.Collection(userdb_client, 'user_base');
		usercollection.find({"user":step.user}).toArray(function(err, docs){
			var user = JSON.parse(JSON.stringify(docs));
			console.log("USER INFORMATION -----------------------------")
			console.log(user);
			time = user[0].last_activity;
			var collection = new mongodb.Collection(db_client, 'users');
		
			collection.insert({
				"step":step.step,
				"user":step.user,
				"alias":step.alias,
				"script":step.script,
				"stepID":step.stepID,
				"parent":step.parent, 
				"url":step.url,
				"local_url":step.local_url,
				"skipped":step.skipped,
				"status":status,
				"deleted":"false",
				"que_time":time,
				"settings":step.settings,
				"start_time":null,
				"resolved_time":null,
				"time_elapsed":null,
				"basinid":step.basinid}, 
			
			{safe:true}, function(err){
					if(err) console.warn(err.message);
					else{
						
					} 
				});
			
		})
	
	
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

function getRunChildren(user, cb){
	var collection = new mongodb.Collection(db_client, 'users')
	collection.find({"user":user.name}).toArray(function(err, docs){
			var run_list = JSON.parse(JSON.stringify(docs));
			cb(run_list);
	})
}

function getRunParents(user, cb){
	var collection = new mongodb.Collection(db_client, 'users')
	collection.find({"user":user.name}).toArray(function(err, docs){
			var run_list = JSON.parse(JSON.stringify(docs));
			cb(run_list);
	})
}

function getStepStatus(_stepID, cb){
	var collection = new mongodb.Collection(db_client, 'users');
	var matching_runs = new Array();

		collection.find().toArray(function(err, docs){
			var run_list = JSON.parse(JSON.stringify(docs));
			
			
			function findParents(id){
			           	//console.log("Looking for objects with parent of " + id)
			           	for(var i=0;i<run_list.length;i++){
			           		if(run_list[i].stepID == id){ //found run from dropdown
			           			//console.log("Found teh run from the dropdown")
			           			for(var x = 0;x < run_list.length; x++){
			           				if(run_list[i].parent == run_list[x].stepID){
			           					matching_runs.push(run_list[x]);
			           					findParents(run_list[x].stepID);
			           				}
			           			}
			           		}
			           	}
			           }
			           
			           
			           
			findParents(_stepID);
			
			//Get the requested run
			for(var q = 0;q < run_list.length;q ++){
				if(run_list[q].stepID == _stepID){
					matching_runs.push(run_list[q]);
				}	
			}
			
			console.log("Added original Run")
			
			var run_return = [];
			for(var s = 0;s < matching_runs.length;s++){
				run_return.push({
					alias: matching_runs[s].alias,
					status: matching_runs[s].status,
					stepID: matching_runs[s].stepID,
					skipped:matching_runs[s].skipped,
					url: matching_runs[s].local_url,
					step: matching_runs[s].step,
					basinid: matching_runs[s].basinid
				})
			} 
			//console.log(run_return);
			cb(JSON.stringify({'run': run_return }))
			
		})
}

function getRun(stepID, cb){
	var collection = new mongodb.Collection(db_client, 'users');
	collection.find({"stepID":stepID}).toArray(function(err, docs){
		var run_list = JSON.parse(JSON.stringify(docs));
		cb(run_list);
	})
}


function getRunDatabase(user, cb){
	
	var collection = new mongodb.Collection(db_client, 'users');
	collection.find({"user":user}).toArray(function(err, docs){
		var run_list = JSON.parse(JSON.stringify(docs));
		cb(run_list);
	})
}


function checkUser(username, cb){
	var time;
	var collection = new mongodb.Collection(userdb_client, 'user_base');
	collection.find({"user":username}).toArray(function(err, docs){
		var user = JSON.parse(JSON.stringify(docs));
		console.log("User is " + user);
		if(user == ""){
			console.log("user does not exist")
			addUser(username, function(){
				cb(null);
			})
		} 
		/*
		else {
			time = user.last_activity;
			var runCollection = new mongodb.Collection(db_client, 'users');
			collection.find({"user":username}).toArray(function(err, rdocs){
				var runs = JSON.parse(JSON.stringify(rdocs));
				console.log("USER'S LAST TIME: " + time);
				cb(runs);
			})
		}
		*/
		//cb(run_list);
	})
}

//Create new User
function addUser(user, cb){
	var collection = new mongodb.Collection(userdb_client, 'user_base');
	collection.insert({
			
			"user":user,
			"last_activity":null,
			"password":null}, 
		
		{safe:true}, function(err){
				if(err) console.warn(err.message);
				else{
					cb();
					console.log("successfully pushed user")
				} 
			});
}

function updateTime(user, time, cb){
	var collection = new mongodb.Collection(userdb_client, 'user_base');

		collection.update({"user": user}, 
		{$set: {
			"last_activity": time, 
			
		}},{safe:true},
          function(err) {
	        if (err) console.warn(err.message);
	        else {
	        	if(cb){
	        			        	cb();
	        	}
	
	        	console.log('successfully updated');
	        }
        });
}


function getMissedRuns(user, cb){
	var lastUserTime;
	var userCollection = new mongodb.Collection(userdb_client, 'user_base');
	userCollection.find({'user':user}).toArray(function(err, docs){
		var user_entry = JSON.parse(JSON.stringify(docs))[0];
		console.log(user_entry);
		lastUserTime = user_entry.last_activity;
		if(lastUserTime == null){
			cb(null);
			return;
		}
		
		var n = lastUserTime.split(" - ");
		var date = n[0];
		var base_time = n[1];
		
		base_time = base_time.split(":");
		date = date.split("/");
		
		var last_data = {
			month:parseInt(date[0]),
			day:parseInt(date[1]),
			year:parseInt(date[2]),
			hour:parseInt(base_time[0]),
			minute:parseInt(base_time[1]),
		}
		
		console.log(last_data)
		
		var missed_run_list = [];
		var runCollection = new mongodb.Collection(db_client, 'users');
			runCollection.find({"user":user}).toArray(function(err, rdocs){
				var runs = JSON.parse(JSON.stringify(rdocs));
				for(var i = 0;i < runs.length;i++){
					var run_n = runs[i].resolved_time;	
					if(run_n != null){
						run_n = run_n.split(" - ");
						var run_date = run_n[0];
						var run_time = run_n[1];
						run_date = run_date.split("/");
						run_time = run_time.split(":");
						var run_data = {
							month:parseInt(run_date[0]),
							day:parseInt(run_date[1]),
							year:parseInt(run_date[2]),
							hour:parseInt(run_time[0]),
							minute:parseInt(run_time[1]),
						}
						console.log(run_data);
						
						//Start checking for < instances
						if(last_data.year < run_data.year){
							missed_run_list.push(runs[i]); //year less than - add
						} else if(last_data.year == run_data.year){ //year same - check month
							if(last_data.month < run_data.month){
								missed_run_list.push(runs[i]); //month less than - add
							} else if (last_data.month == run_data.month){ //month same, check day
								if(last_data.day < run_data.day){ //day less than - add
									missed_run_list.push(runs[i]);
								} else if(last_data.day == run_data.day){ //day same, check hour
									if(last_data.hour < run_data.hour){
										missed_run_list.push(runs[i]); //hour less than - add
									} else if(last_data.hour == run_data.hour){ //hour same - check minute
										if(last_data.minute <= run_data.minute){
											missed_run_list.push(runs[i]); //minute less than - add
										}
									}
								}
							}
						}

					}
				}
				
				cb(missed_run_list);
				
			})
		
		
	});
}

exports.getRun = getRun;
exports.getAllRuns = getAllRuns;
exports.getMissedRuns = getMissedRuns;
exports.updateTime = updateTime;
exports.checkUser = checkUser;
exports.getRunDatabase = getRunDatabase;
exports.getRunChildren = getRunChildren;
exports.getRunParents = getRunParents;
exports.getStepStatus = getStepStatus;
exports.addStepToDatabase = addStepToDatabase;
exports.getQueuedRuns = getQueuedRuns;
exports.breakTest = breakTest;
exports.setStatus = setStatus;
exports.openDatabase = openDatabase;