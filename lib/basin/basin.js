var config = require('../config'); //Configuration Files
var fs     = require('fs'); //File System
var spawn  = require('child_process').spawn;
var async  = require('async');
var mkdirp = require('mkdirp');

// The basin directory:
var BASIN_DIR  = config.server.BasinsDir;
var MODELS_DIR = config.server.ModelsDir;

//TODO: add data directory.
var DATA_DIR = config.server.DataDir;

// A Basin object representing a basin.
function Basin(config) {
  for (var prop in config) {
    this[prop] = config[prop];
  }
}

// Writes configuration parameters from parameter `config`
// which is a JS object.
Basin.prototype.writeConfig = function (config) {
  // Method for writing an alias to a basin's param.json file.

};
//input the lat and long, 
//call back function accepts the basinID as a parameter do something with it.

var delineateBasin = function (lat, lng, cb) {
  // Function to create/retrieve basin using basin deliniation;
  var spawnOpt = {
    cwd: MODELS_DIR + '/r',
    env: process.env
  };

  console.log(JSON.stringify(process.env, null, 2));
  console.log('lat: ' + lat);
  console.log('lng: ' + lng);
  console.log('basin_dir: ' + BASIN_DIR);
  console.log('data_dir : ' + DATA_DIR);
  console.log('models dir:' + MODELS_DIR);

  var Args = JSON.stringify({ 'lat'       : lat, 
                              'long'      : lng, 
                              'basin_dir' : BASIN_DIR, 
                              'data_dir'  : DATA_DIR });
  console.log('Invoking delineate_basin.R with arguments: ');
  console.log(Args);
  var RArg = ['basin/delineate_basin.R', Args];
  var rs = spawn('/usr/bin/Rscript', RArg, spawnOpt);
  // gives BASIN_DIR to R script, returns basin id.
  rs.stdout.on('data',function(data){
    var str = data.toString().split(": ");
    console.log(str);
    if(str[0].indexOf('basinid')!== -1|| str[0].indexOf('featureID')!== -1) {
      // use the call back function to return the response.
      rs["basinID"] = str[1].split('"')[0];
      console.log("lib/basin/basin.js: basinID = " + rs["basinID"]);
      //cb(undefined, str[1]);
  }else{
    //cb({msg: "cannot get basin ID: "+data.toString()});
  }
  });
  rs.stderr.on('data',function(data){
    console.log("delineate_basin.R err data:"+data.toString());
  });
  rs.stdout.on('end',function(data){    
    if(rs["basinID"]){
      cb(undefined,rs["basinID"]);
    }else{
      cb({msg:"no input from delineate_basin.R"});
    }
  });
};

// The preDefinedBasins function retrieves the list of pre-defined
// basins invoking the given callback `cb` with the following
// signature: 
//   cb(err, basin_list)
// where the basin_list is a list of the predefined basins if `err` is
// `undefined`; otherwise err will have a `msg` property indicating
// the error.
function preDefinedBasins(cb) {
  fs.readFile(BASIN_DIR + '/predef.json', function (err, data) {
    if (err) {
      cb({ msg : 'Error reading ' + BASIN_DIR + '/predef.json' });
    }
    else {
      var predef  = JSON.parse(data);
      var length  = predef.predef_basins.length;
      var pdpaths = [];
      for(var b = 0; b < length; b++) {
        pdpaths.push(BASIN_DIR + '/' + predef.predef_basins[b] + '/param.json');
      }
      console.log(JSON.stringify(pdpaths));
      async.map(pdpaths, fs.readFile, function (err, contents) {
        if (err) {
          cb({ msg : 'Error reading param files in predef basins: ' + err });
        }
        else {
          var length = contents.length;
          var basins = [];
          for (var b = 0; b < length; b++) {
            basins.push(new Basin(JSON.parse(contents[b])));
          }
          cb(undefined, basins);
        }
      });
    }
  });
}

// The basinInfo function retrieves information related to the given
// basin `id`. The callback `cb` will receive an object containing the
// properties that correspond to the param.json file for a particular
// basin.
function basinInfo(id, cb) {
  var path = BASIN_DIR + '/' + id + '/param.json';
  fs.readFile(path, function (err, data) {
    if (err) {
      cb({ msg : 'Error reading ' + path });
    }
    else {
      try {
        cb(undefined, new Basin(JSON.parse(data)));
      }
      catch(syntax_error) {
        cb({ msg : 'Bad formatting in ' + path});
      }
    }
  });
}

//assume the basinID-alias pair are in basin/aliaslist.json in the user directory.
//get user object and a callback function
//return: an array of basinid-ailias pairs.
function userBasinList(user,cb) {
  if(!user){
    console.log("require login user session to get basinList");
    cb("err: invalid user session");
    return ;
  }
  console.log("["+(new Date())+"]"+user.name+": query basin alias");
  // Function to return list of basin aliases/basin ids:
  //  1. the user basin list stored in user directory.
  fs.readFile(user.dir+'/basin/aliaslist.json',function(err,data){
    if(err) {
      mkdirp(user.dir+'/basin');
      data = '{"list":[]}';
      fs.writeFileSync(user.dir+'/basin/aliaslist.json', data);      
    }else{
      var list = JSON.parse(data);
      list = list.list;
      console.log('list='+list);
      if(cb){
        cb(undefined,list);
      }
      return list;
    }
  });
  //  2. the global alias list stored in data/basins.
}



//param:
//  user: user object
//  pair: id-alias such as { "basin_id" : ID, "basin_alias" : ALIAS }
//  cb  : callback function(err, updated_array_list)
function addBasin_IDAlias(user,pair,cb){	
//	console.log(user);
  if(!pair||!pair.basin_id||!pair.basin_alias||!user){
    console.log("the ID-alias or user does not exists!!!! \n !pair||!pair.basin_id||!pair.basin_alias||!user");
    cb({msg:"the ID-alias does not exists!!!!"});
    return ;
  }
//  console.log(JSON.stringify(pair));
  fs.readFile(user.dir+'/basin/aliaslist.json',function(err,data){
    var ls = {list:[]};
    if(!err){
      ls = JSON.parse(data);
    }else{
      mkdirp(user.dir+'/basin');
    }
    //console.log("read: "+JSON.stringify(ls));
    var list = ls.list; 
    for(idx in list){
      if(list[idx].basin_alias == pair.basin_alias){
        if(cb){
          cb({msg:"basin alias already exists for this user"});
        }
        return;
      }    
    }
//    console.log("before: "+JSON.stringify(ls));
    ls.list.push(pair);
//    console.log(JSON.stringify(pair)+'pushed\nafter:' + JSON.stringify(ls));
    fs.writeFile(user.dir+'/basin/aliaslist.json', JSON.stringify(ls), function(err){
        if(err){
          if(cb){
            cb({msg:"write alias-id file failed"});
          }
        }else{
          if(cb){
        	  console.log("["+(new Date())+"]"+user.name+": add basin alias--"+JSON.stringify(pair));
            cb(undefined, list);
          }
        }
      });
  });
  
  
}

// Exported Values:
exports.preDefinedBasins = preDefinedBasins;
exports.basinInfo = basinInfo;
exports.userBasinList = userBasinList;
exports.addBasin_IDAlias = addBasin_IDAlias;
exports.delineateBasin = delineateBasin;



