var runs = require('./buildRunModel.js');
var mexec = require('./batchrun.js');
var reqInfo = require('./b.json');
var users = require('../users');
var config = require('../config');

var ModelDir = config.server.ModelsDir+'/r';

var user = new users.User("testuser1");
user.dir = './test/testuser';
var settings = reqInfo.webInfo;
console.log(settings);
/*//test save ModelTree()
var runs = mexec.buildRuns(settings,user);
	console.log(runs);
	if(runs.length>0) {//TODO: set the directory for the r scripts
		//mexec.runModels(runs,0,ModelDir);
		mexec.saveModelTree(runs,user);
	}
*/
/*// test get tree from basin id
user.getRunTreeFromBasin("west_brook",function(err,tree){
	if(err) console.log(err);
	else{
		console.log(JSON.stringify(tree));
	}
})
*/
/*
user.getRuns("landoo",function(err,runs){
	if(err) console.log(err);
	else{
		for(var i=0;i<runs.length;i++){
			console.log(JSON.stringify(runs[i])+'\n');

		}
		
	}
});
*/
user.getRunResult("landoo","99fb3621-1308-4fb7-8fdb-87c45759540e",function(err,result){console.log(result);});
