// A library for representing users.
var fs     = require('fs');
var mkdirp = require('mkdirp');
var uuid   = require('node-uuid');
var config = require('../config');
var runs   = require('../runs');
var mongodb		 = require('mongodb');


// The default user directory containing all the user directories:
var USER_DIR = config.server.UsersDir;

// Errors returned to clients of this library:
var ERRORS = {
  USER_EXISTS : {
    code : 'USER_EXISTS',
    msg  : 'User Exists'
  },
  SETTINGS_ERROR : {
    code : 'SETTINGS_ERROR',
    msg  : 'Error writing settings file.'
  }
};

// A run directory...
function RunDirectory(user, scriptname, id) {
  this.user       = user;
  this.scriptname = scriptname;
  this.id         = id;
  this.path  = user.dir + '/' +
               scriptname + '/' +
               id;
}

RunDirectory.prototype.writeSettings = function(settings, cb) {
  var file = this.path + '/settings.json';
  //console.log("writesettings from runDir.writeSettings(): "+file);
  fs.writeFile(file, JSON.stringify(settings)+'\n', function (err) {
	  if(cb){
    if (err) {
    	console.log(ERRORS.SETTINGS_ERROR);
    	cb(ERRORS.SETTINGS_ERROR);
    }
    else {
      //TODO: there is error about undefined is not a function when using cb(undefined, this.path+...);
      cb(undefined, this.path + '/settings.json');
    }
    }
  });
};

// A constructor function for users.  We may change this in the
// future to use Mongoose.js to represent users in a database or
// possibly connect it up to HubZero.
function User(name) {
  this.name = name;
  this.dir  = USER_DIR + '/' + name;
}



//
// The getRuns method takes a `stepname` and a callback `cb`
// function. The `stepname` should be one of the valid step names. The
// callback must have the following signature:
//
//   cb(error, runlist)
//
// where the runlist is a list of runs.Run objects.
//
User.prototype.getRuns = function (stepname, basin_id, cb) {
  // Create a Runs object:
  var userRuns = new runs.Runs(this);
  // Get the runs:
  userRuns.getRuns(stepname, basin_id, cb);
};

// get all the runs of a script
// User.prototype.getRuns = function (scriptname, cb) {
//   var that = this;
//   if(!cb){
//     console.log("need callback to return run settings");
//     return;
//   }
//   var runArray =[];
//   //var idArray = fs.readdirSync(this.dir + '/' + scriptname);
//   var path = this.dir + '/' + scriptname;
//   var runlib = runs;
//   fs.readdir(path,function(err,idArray){
//     if(!err){
//       for(var i=0; i<idArray.length; i++){
//         var aRun = new (runlib.Run)(that,scriptname,idArray[i]);
//         console.log(aRun);
//         aRun = aRun.getSetting();
//         if(aRun){
//           runArray.push(aRun);
//         }else{
//           console.log(id+' has invalid setting');
//         } 
//       }      
//     }
//     cb(err,runArray);
//   });  
// };

//Finds user in MongoDB
User.prototype.findUser = function(username){
	
}


//given previous runs, get the child runs
//constraints is an array, where each element is {modelname:"scriptname"}
User.prototype.getConstraintRuns = function(constraints,scriptname){
  var runArray = this.getRuns(scriptname);
  var constrRuns = [];
  for(var i=0; i<runArray.length;i++){
    for(var model in constraints){
      if(runArray.preceding[model] === constraints[model]){
        constrRuns.push(runArray[i]);
      }
    }
  }
  return constrRuns; 
};

// Gets the setting of a particular run given the run id:
User.prototype.getARun = function(scriptname,runId){
  if(!scriptname||!runId){
    console.log("User.prototype.getARun: get invalid parameter!");
    return null;
  }
  fs.exists(this.dir+'/'+scriptname+'/'+runId, function(exists){
    if(exists) {
      //TODO:decide whic files to read.
      return new runs.Run(this,scriptname,runId);
    } else {
      console.log("Run does not exist: "+this.dir+'/'+scriptname+'/'+runId);
      return null;
    }
  });
};

User.prototype.getRunResult = function(scriptname,runId,cb){  
  var path = this.dir+'/'+scriptname+'/'+runId;
  console.log(path);
  if(cb){
    fs.exists(path,function(exists){
      if(exists) {
        fs.readdir(path,cb(err,fileArray));
      } else {
        console.log("path does not exist: "+path);
        cb({msg:'the run does not exits: '+scriptname+'/'+runId});
      }
    });
  }else{
    console.log('no callback to return run result');
  }
};

User.prototype.addRunNode = function(node,cb){
  var treeDir = this.dir+'/tree';
  var tfile = treeDir+'/runTree.json';
  var tree ={};
  if(!fs.existsSync(treeDir)){
    mkdirp(treeDir,function(err){
      if(err) throw err;
      if(fs.existsSync(tfile)){
        tree = fs.readFileSync(tfile);
        if(!tree){
          tree = {};
        }else{
          tree = JSON.parse(tree);
        }
      }
    });
  }
  tree[node.runid] = node;
  fs.writeFile(tfile,JSON.stringify(tree));
  if(cb){
    cb(tree);
  }
};
/*
User.prototype.getRunTree = function(idArray,cb){
  var results = {};

  return results;
};
*/
// Creates a new run directory for the user:
User.prototype.newRunDirectory = function (scriptname, cb) {
  var rundir = new RunDirectory(this, scriptname, uuid.v4());
  mkdirp(rundir.path, function (err) {
    cb(err, rundir);
  });

};

// create a new run ID for a run
User.prototype.newRunID = function(){
  return uuid.v4();
};

// create a new Run directory given the script name and a run ID.
User.prototype.createRunDir = function(scriptname,runid,cb){
  var rundir = new RunDirectory(this,scriptname,runid);
  mkdirp(rundir.path, function(err){
    if(cb){
      cb(err, rundir);
    }
  });
  return rundir;
};

User.prototype.getRunTreeFromBasin = function(basinid,cb){
  var tree = {};
  if(cb){  
    if(!basinid){
      cb({msg:'unmatched data structure for basin ID, post basinid=xxx'});
      return;
    }
    var treePath = this.dir+'/tree/modelTrees.json';
    fs.exists(treePath,function(exists){
      if(!exists){
        console.log('no mode tree record exist: there is no run that has be executed!');
        cb({msg:'no mode tree record exist: there is no run that has be executed!'});
        return ;
      }
      fs.readFile(treePath,function(err,allruns){
        if(err){
          console.log(err);
          cb(err);
          return;
        }
        tree = JSON.parse(allruns);
        if(tree[basinid]){
          cb(undefined,tree[basinid]);
        }else{
          console.log('no run is based on the current basin ID: '+basinid);
          cb({msg: 'no run is based on the current basin ID: '+basinid});
        }
      }); 
    });
       
  }
};

exports.test = function (path, cb) {
  mkdirp(path, cb);
};

// For the moment we will provide only three hard-coded users. In
// the future we will support user creation when we understand how
// we will be doing this.
var users = { };

// Returns true if the user exists; false otherwise.
function exists(name) {
  return name in users;
}

function createUser(name, cb) {
  if (exists(name)) {
    cb(ERRORS.USER_EXISTS);
  }

  var user = new User(name);
  fs.stat(user.dir, function (err, stats) {
    if (err) {
      // This is good, if the user directory does
      // not exist then create it.
      if (err.code === 'ENOENT') {
        fs.mkdir(user.dir, function () {
          // If no exceptions, then we are good.
          // TODO: handle exceptional case...
          users[name] = user;
          cb(undefined, user);
          return;
        });
      }
    }
    // Should not reach this point.
    //throw err;
  });
}

// Returns the user if they exist; undefined otherwise.
function lookup(name) {
  if (name in users) {
    return users[name];
  }
  return undefined;
}

// Create user directory if it does not exist:
fs.stat(USER_DIR, function (err, stats) {
  if (err) {
    if (err.code === 'ENOENT') {
      fs.mkdir(USER_DIR, function () {
        createUser('testuser1', function (err, user) {
          users[user.name] = user;
        });
        createUser('testuser2', function (err, user) {
          users[user.name] = user;
        });
        createUser('testuser3', function (err, user) {
          users[user.name] = user;
        });
      });
    }
  }
  else {
    console.log(USER_DIR);

    // user directory exists, so we have the test
    // user directories.
    users['testuser1'] = new User('testuser1');
    users['testuser2'] = new User('testuser2');
    users['testuser3'] = new User('testuser3');
  }
});



exports.createUser = createUser;
exports.exists = exists;
exports.lookup = lookup;
exports.User = User;