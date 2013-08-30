//ROUTE HANDLER
// -- Controls the changing of pages throughout the app

var mongodb		 = require('mongodb');
var http  = require('http');
var users = require('../lib/users');
var fs     = require('fs');
var database = require("../lib/database");
var fs = require('fs');
var archiver = require('archiver');

/* The first time the route is called, if the username is undefined - switch to the login screen
*	Otherwise, continue to the correct route.
*/ 
exports.main = function (req, res) {
  if (req.session.user === undefined) {
    res.redirect('/');
  }
  else {
  	//Render the main.ejs file with title and user as additional information. 
    res.render('main.ejs',
               { 'title' : 'Streams',
                 'user'  : req.session.user.name });
  }
};

exports.dashboard = function (req, res) {
  res.render('dashboard.ejs',
             { 'title' : 'Dashboard' });
};
exports.riparian= function (req, res) {
  res.render('riparian.ejs',
             { 'title' : 'Riparian' });
};

exports.about = function (req, res) {
  res.render('about.ejs',
             { 'title' : 'About The Project' });
};

exports.documentation = function (req, res) {
  res.render('documentation.ejs',
             { 'title' : 'Documentation' });
};

//Front Page, will redirect to login or main
exports.front = function (req, res) {
  res.render('front',
             { 'title' : 'Streams' });
};

//Front Page, will redirect to login or main
exports.posttext = function (req, res) {
  console.log(req);
};


exports.getRunDatabase = function(req, res){
		//if(user = undefined){return;}

	var username = req.session.user.name;
	var basinId = req.body.basinId;
	console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
	if(username == undefined){
		res.redirect("/");
		return;
	} 
	database.getRunDatabase(username, function(data){
		var run_list = data;
					if(run_list == undefined){
						console.log("THE RUN LIST IS NULL")
						res.json({ 'user' : req.body });
						return;
					}
					var tree = new Object();
					//Set Basin
			        tree.alias = basinId;
			        //Set Array
					tree.children = new Array();
					
					/*
					for(var c = 0;c < run_list.length;c++){
						run_list[c].children = new Array();
					}
					*/
					console.log("RUN LIST -------------------")
					//console.log(run_list);
					
					function findChildren(p){
			           //	console.log("Looking for objects with parent of " + p.stepID)
			           	for(var i=0;i<run_list.length;i++){
			           		//console.log("PARENT: " + run_list[i].parent);
			           		//console.log("CHILD: " + p.stepID)
			           		if(run_list[i].parent == p.stepID){
			           			//console.log("I found a match!" + run_list[i].stepID);
			           			//console.log("Adding it to the parent...")
			           			//console.log("p.children == " + p.children)
			           			if(p.children == undefined){
			           				p.children = new Array();
			           			}
			           			p.children.push(run_list[i])
			           			findChildren(run_list[i])
			           			
			           		}
			           	}
			           }
	        		
	       			//console.log("TREE ------------------  ")
	       			// console.log(tree);
	       			 
	       			 
	       			// console.log("FINDING THE BASIN PARENTS:" + run_list.length)
	       			  for(var x = 0; x < run_list.length;x++){
	       			  	//console.log(run_list[x].parent)
			        	if(run_list[x].parent == "basin"){
			        		if(run_list[x].basinid == basinId){
			        			tree.children.push(run_list[x]);
								 findChildren(run_list[x]);
			        		};
			        	}
			        }
			        
	
					
					//console.log("WRITING INFORMATION TO "+ "/home/node.js/users/" + username + "/data.json" )
					var file = "/home/node.js/users/" + username + "/data.json";
					fs.writeFile(file, JSON.stringify(tree), function (err){
						if(err){
							console.log(err)
							console.log("ERROR WRITING DATA FILE")
							res.json({message:"ERROR WRITING FILE: " + err})
						}
					})
					res.json({ 'user' : req.body });
	});

	
}

//Login Screen
exports.login = function (req, res) {
  res.render('login',
             { 'title' : 'Streams Login' });
};


//Called from the Login Button, gets the username html value from <select name="username">
exports.login_user = function (req, res) {
  var user = undefined;

  console.log("post body: ")
  console.log('[login_user] req.body.username = ' + req.body.username);
  console.log('[login_user] req.body.time = ' + req.body.time);
  
  // Check to see if the username was sent as part
  // of the request body:
  if (req.body.username) {
    user = users.lookup(req.body.username);
  }
	
  //If no user has been selected, redirect to login.
  //TODO: Used when actual login is in place
  if (!user) {
    res.redirect('/login');
  }
  else {
    req.session.user     = user;
    req.session.username = user.name;
    req.session.time	 = req.body.time;
    console.log(user);
    
    user.findUser(user.name);
    	res.redirect('/streams');

	//res.redirect('/dashboard');
  }
};

// A new interface to the streams application
exports.v2 = function (req, res) {
  res.render('version2.ejs',
             { 'title' : 'Streams',
               'layout': 'layout2.ejs' });
};

exports.stream = function (req, res) {
    var options = {
        host: 'streamstatsags.cr.usgs.gov',
        path: '/ss_ws_92/Service.asmx/getStreamstats?x=-111.1563&y=39.4725&inCRS=EPSG:6.6:4326&StateNameAbbr=UT&getBasinChars=C&getFlowStats=C&getGeometry=KML&downloadFeature=False&clientID=UT%20Demo'
    };

    console.log('Making HTTP request...');

    var req_stream = http.get(options, function (res_stream) {
        console.log('Got response: ' + res_stream.statusCode);
        res_stream.on('data', function (chunk) {
            console.log(chunk);
        });
    }).on('error', function (e) {
        console.log('Got error: ' + e.message);
    });
    
    console.log('Returning result...');
    req_stream.end();
    res.send('<p>Yippy</p>');
};

exports.myfirstpost  = function (req, res){
	var num = req.body.number;
	num = num * 2;

	res.json({"result": num});
}

exports.getZip = function (req, res){
	/*
	var outputFile = fs.createWriteStream('/home/node.js/users/testuser1/climate/46267f01-7c93-4fb0-99fb-111f8ff3f96f/example-output.zip');
	var archive = archiver('zip');
	var dir = '/home/node.js/users/testuser1/climate/46267f01-7c93-4fb0-99fb-111f8ff3f96f';
	var file = 'testZip';
	var results = [];
		
	var walk = function(dir, done){
		results = [];
		fs.readdir(dir, function(err, list){
			if (err){
			return done(err)
			}
			var pending = list.length;			
			if (!pending){
				return done(null, results) 
				};			
			list.forEach(function(file){
				file = dir + '/' + file; 
				var stats = fs.stat(file, function(err, res){
					if (stats) {
						walk(file, function(err, res){
							results = results.concat(res);
							if (!--pending){ done(null, results) 
							}
						});
					} else {
						results.push(file);
						if (!--pending) done(null, results);
					}
				});
			});
		});
	};
	
	walk(dir, function(err, results){
		console.log("results length: " + results.length)
		archive.pipe(outputFile);
		for (i = 0; i < results.length; i++){
			var fileType = results[i].split('.');
			var fileName = results[i].split('/');
			fileType = fileType.pop();
			fileName = fileName.pop();
			console.log(fileName)
			if (fileName != 'example-output.zip'){			
				archive.append(fs.createReadStream(results[i]), { name: fileName + '.' + fileType})					
				archive.finalize(function(err, written) {
					 if (err) {
					   throw err;
					 }
				});
			}
		}
	})
	
	
	archive.on('error', function(err){
		throw err;
	});
	*/
	
}
