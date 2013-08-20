/**
 * New node file use spawn to test
 */
var fs = require('fs');
var spawn = require('child_process').spawn;
var mkdirp = require('mkdirp');

var getPath = function(user,model, runId){
	return './'+user+'/'+model+'/'+runId;
};

var runStats ={};
var buildScriptPara = function (run) {
	var paras;

	for (var prerun in run['pre_runs']) {
		path = getPath(prerun.user,prerun.scriptName,prerun.runId);
		fs.readFile(path);
	}

	if(run['input'] !== null){
		for(var p in run['para']){
			//console.log(run['input']);
			if(run['input'][p] !== null)
				paras[p]=run['input'][p];
		}
	}
	return paras;
};

function mkdir_p(dirPath, mode, callback) {
	//Call the standard fs.mkdir
	require('fs').mkdir(dirPath, mode, function(error) {
		//When it fail in this way, do the custom steps
		if (error && error.errno === 34) {
			//Create all the parents recursively
			mkdir_p(require('path').dirname(dirPath), mode, callback);
			//And then the directory
			mkdir_p(dirPath, mode, callback);
		}
		//Manually run the callback since we used our own callback to do all these
		callback && callback(error);
	});
}


var getArgs = function(paras){
	var agrs=[];
	for(var p in paras){
		args.push(p);
	}
	return args;
};
/*
var outputfile = function(Rrun, data){
	path = getPath(Rrun['user'],Rrun['scriptName'],Rrun['runId']);
	
	fs.exists(path,function(exists){
      if(!exists)	{
        mkdir_p(path);
      }
    });
    var regex = /\w+/g;
	newdata = data.match(regex).toString();
	regex = /\[[^\]]+\]/g;
	newdata.replace(regex,"");
	fs.writeFile(path, newdata, function(err){
		if (err) throw err;
    console.log(Rrun['runId']+' is saved!');
	});
};
*/
var runModels = function(runs,idx,modelpath) {
	runStats = {};
	for(var i = 0;i<runs.length;i++){
		runStats[runs[i]["scriptName"]] = false;
	}
	Rrun = runs[idx];
	//console.log("model path: "+modelpath);
	//set up directory for this runs
	path = getPath(Rrun['user'],Rrun['scriptName'],Rrun['runId']);
	//if(fs.exists){
		fs.exists(path,function(exists){
			if(!exists){
			//console.log(path);
			mkdir_p(path);
			console.log("create dir for run: "+Rrun['scriptName']);
	      }
		});
	/*}else{
		require('path').exists(path,function(exists){
		      if(!exists){
					//console.log(path);
			        mkdir_p(path);
			      }
				});
	}*/
	
	//prepare for spawn arguments
	RArgs =[Rrun['scriptName']+'.R'];
	var paras =JSON.stringify(Rrun);
	RArgs = RArgs.concat(paras);
	spawnOpt = {
		cwd:  modelpath,
		env: process.env
	};
	var ls = spawn('Rscript',RArgs,spawnOpt);
	ls['data']=Rrun['user']+' '+Rrun['runId']+' '+Rrun['scriptName'];
	

	ls.stdout.on('data', function (data) {
		ls['data'] = data.toString();
		console.log('stdout : ' + ls['data']);
	});

	ls.stdout.on('end', function(data){
		//console.log('stdEnd : ' + ls['data']);
		
	});

	ls.stderr.on('data', function (data) {
    	console.log('stderr: ' + data);
	});

	ls.on('exit', function (code) {
    //console.log('child process exited with code ' + code);
    console.log(Rrun['runid']+' complete');
    //TODO:outputfile(Rrun,ls['data'])
    runStats[Rrun['scriptName']] = true;
    idx++;
    if(idx<runs.length){
      runModels(runs,idx,modelpath);
    }
	});
};

//save runs to modeltree
var saveModelTree = function(runs,user){
	if(runs.length<1){
		return;
	}
	var path = user.dir+'/tree/modelTrees.json';
	var mt = {}	
	var basinid = runs[0].basin_id;;
	if(!fs.existsSync(path)){
		console.log("no path: "+path);
		mkdirp(user.dir+'/tree',function(err){
			if(!err){ //new file
				mt[basinid] = {
					basinid : basinid,
					children:[]
				};
				for(var i=0;i<runs.length;i++){
					var Arun =runs[i];
					var id = Arun["basin_id"];
					for(var pre in Arun["preceding"]){
						id = Arun["preceding"][pre+"_runid"];
						console.log("Arun preceding: "+JSON.stringify(Arun["preceding"]));						
						break;
					}
					var node ={
						name: Arun["name_alias"],
						modelname:Arun["modelname"],
						scriptName: Arun["scriptName"],
						runid: Arun["runid"],
						children: []
					}

					console.log("id = "+id);
					var parentnode = searchMTNode(mt[basinid],treeLevel[Arun["modelname"]]-1,id);
					if(parentnode){
						parentnode.children.push(node);
					}
				}
				fs.writeFile(path,JSON.stringify(mt),function(err){
					if(err) throw err;
				});
			}else{
				throw err;
			}
		});
	}else{
		mt = fs.readFileSync(path);
		mt = JSON.parse(mt);		
		if(!mt[runs[0].basin_id]){
			
			mt[basinid] = {
					basinid : runs[0].basinid,
					children:[]
				};
		}
		for(var i=0;i<runs.length;i++){
					var Arun =runs[i];
					var id = Arun["basin_id"];
					for(var pre in Arun["preceding"]){
						id = Arun["preceding"][pre+"_runid"];
						break;
					}
					var node ={
						name: Arun["name_alias"],
						modelname:Arun["modelname"],
						scriptName: Arun["scriptName"],
						runid: Arun["runid"],
						children: []
					}
					//console.log("read tree: "+basinid);
					var parentnode = searchMTNode(mt[basinid],treeLevel[Arun["modelname"]]-1,id);
					if(parentnode){
						parentnode.children.push(node);
					}
				}
				fs.writeFile(user.dir+'/tree/modelTrees.json',JSON.stringify(mt),function(err){
					if(err) throw err;
				});
	}
};

var treeLevel = {
	basin:1,
	climate:2,
	land:3,
	flow:4,
	temp:5,
	fish:6
};
//find parent node to store a node in modeltree
function searchMTNode(tree,lev,id){
	//console.log("array: "+JSON.stringify(tree.children)+", lev: "+lev+", id: "+id);
	if(lev ===0) return false;
	if(lev ===1){
		if(tree.runid === id||tree.basinid ===id)
			return tree;
		else
			return false;
	}else{
		//console.log("searchnode: "+tree["children"].length);
		for(var i=0;i<tree["children"].length;i++){
			var result = searchMTNode(tree.children[i],lev-1,id);
			if(result) return result;
		}
		return false;
	}
}
//tmp for saveModelTree
//use the result.push() to store climate run
function smtclimate(basinid,tree,run){
	if(!tree[basinid]){
		tree[basinid] = {	name:basinid,
							basinid:basinid,
							image:null,
							children:[]
		};
	}
	return tree[basinid].children;
}
function getMtArray(prerun,parentArray){
	var climate = undefined;
	for(var i=0;i<parentArray.length;i++){
		if(parentArray[i].runid === prerun.runid){
			climate = parentArray[i];
			break;
		}
	}
	if(!climate){
		climate = {
					name:prerun.name,
					runid:prerun.runid,
					children:[]
		}
	}
	return climate.children;

}



exports.runModels = runModels;
exports.buildRuns = require('./buildRunModel.js').buildRuns;
exports.mkdir_p = mkdir_p;
exports.rimraf = require('./rmdirrf.js').rimraf;
exports.saveModelTree = saveModelTree;
