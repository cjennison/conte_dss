var fs     = require('fs');
var mongodb		 = require('mongodb');
// This module represents runs performed by a user.

// A run directory:
function Run(user, stepname, mid) {
  this.user      = user;
  this.stepname  = stepname;
  this.mid       = mid;
  this.path  = user.name + '/' +
               stepname + '/' +
               mid;
}

Run.prototype.writeSettings = function(settings, cb) {
  var file = this.path + '/settings.json';
  fs.writeFile(file, JSON.stringify(settings), function (err) {
    if (err) {
      cb(ERRORS.SETTINGS_ERROR);
    }
    else {
      cb(undefined, this.path + '/settings.json');
    }
  });
};

// The collection of user runs:
function Runs(user) {
  this.user = user;
  this.runs = [];
}

Runs.prototype.getRuns = function (stepname, basin_id, cb) {
	var runsToRead = [];
	var that = this;
	console.log("BASIN ID")
	console.log(basin_id);
	console.log("USER NAME")
	console.log(this.user)
	
	var server = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('users', server, {}).open(function(error, client){
		if(error) throw error;
		console.log("CONNECTED")
		var collection = new mongodb.Collection(client, 'users');
		
		
		
		collection.find({"user":that.user.name, "status":"COMPLETED"}).toArray(function(err, docs){
			//console.log(docs);
			var docStr = JSON.stringify(docs);
			
			var json = JSON.parse(docStr);
			
			var dbruns = json;
			for(var i=0;i<dbruns.length;i++){
				if(dbruns[i].basinid == basin_id && dbruns[i].step == stepname){
					runsToRead.push(that.user.name + "/" + stepname + "/" + dbruns[i].stepID + "/settings.json")
				}
			}
			
			
			function eliminateDuplicates(arr) {
			  var i,
			      len=arr.length,
			      out=[],
			      obj={};
			
			  for (i=0;i<len;i++) {
			    obj[arr[i]]=0;
			  }
			  for (i in obj) {
			    out.push(i);
			  }
			  return out;
			}
			
			var sortedarray = eliminateDuplicates(runsToRead);
			
			//console.log("IENCIUCNIRUNCIRNIRNCOIRMNIRCN")
			//console.log(sortedarray);
			//console.log(dbruns)
			
			cb(undefined, sortedarray)
		})
	});
	
	/*
  var that = this;
  console.log(this.user);
  // Read the list of run directories in a step:
  fs.readdir(that.user.dir, function (err, step_list) {
    if (err) {
      cb(err);
    }
    else {
      var path = that.user.dir + '/' + stepname;
      fs.readdir(path, function (err, run_list) {
		if (err) {
		  cb("Error reading directory: " + path);
		}
		else {
		  var runs = [];
		  var dlen = run_list.length; //directory length
		  for (var i = 0; i < dlen; i++) {
		    var run = new Run(that.user, stepname, run_list[i]);
		    runs.push(run);
		  }
		  cb(undefined, runs);
		}
      });
    }
    */
 

  //     for (var s = 0; s < step_list.length; s++) {
  //       var step = step_list[s];
  //       if (step !== 'config' && step === stepname) {
  //         // Read the list of runs directories in the step directory:
  //         fs.readdir(that.user.dir + '/' + step, function (err, run_list) {
  //           if (err) {
  //             cb(err);
  //           }
  //           else {
  //             for (var r = 0; r < run_list.length; r++) {
  //               var run = new Run(that.user, step, run_list[r]);
  //               that.runs.push(run);
  //             }
  //           }
  //         });
  //       }
  //     }
  //     cb(undefined, that.runs);
  //   }
  // });
};




//get the full setting of this run
Run.prototype.getSetting = function(){
  var setting = JSON.parse(fs.readFileSync(this.path+"/settings.json"));
  if(!setting) 
    console.log("the run["+this.stepname+" : "+
		this.id+"] has no setting yet/ or read file error");
  return setting;
};

//get the output result from r script
Run.prototype.getResult = function(){
  if(fs.exists(this.path)){
    var files = fs.readdirSync(this.path);
  //TODO:
  }else{
    console.log("Run does not exist");
    return null;
  }
  
};


// Export Runs object:
exports.Runs = Runs;
exports.Run = Run;
