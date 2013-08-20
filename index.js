//ROUTE HANDLER
// -- Controls the changing of pages throughout the app

var mongodb		 = require('mongodb');
var http  = require('http');
var users = require('../lib/users');
var fs     = require('fs');


/* The first time the route is called, if the username is undefined - switch to the login screen
*	Otherwise, continue to the correct route.
*/ 
exports.main = function (req, res) {
  if (req.session.user === undefined) {
    res.redirect('/login');
  }
  else {
  	//Render the main.ejs file with title and user as additional information. 
    res.render('main.ejs',
               { 'title' : 'Streams',
                 'user'  : req.session.user.name });
  }
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
	var username = req.session.user.name;
	var basinId = req.body.basinId;
	//var request = req;
	//console.log(request);
	console.log(basinId);
	
	if(!username){
		res.json({message:"require a username"})
		return;
	}
	
	var server = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('users', server, {}).open(function(error, client){
		if(error) throw error;
		console.log("CONNECTED")
		var collection = new mongodb.Collection(client, 'users');
		
		
		collection.find({"username":username}).toArray(function(err, docs){
			if(docs == ""){
				res.json({message:"user does not exist"})
			} 
			else {
				console.log(docs);
				var docStr = JSON.stringify(docs);
				
				
				//JSON FIle has be retrieved from the Mongo Databsase
				var json = JSON.parse(docStr);
				console.log(json[0].runs[0])
				
				if(json[0].runs[0] == undefined){
					res.json({message:"NO RUN INFO"})
				} else {
					var run_list = json[0].runs;
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
					
					function findChildren(p){
			           	console.log("Looking for objects with parent of " + p.stepID)
			           	for(var i=0;i<run_list.length;i++){
			           		if(run_list[i].parent == p.stepID){
			           			console.log("I found a match!" + run_list[i].stepID);
			           			console.log("Adding it to the parent...")
			           			console.log("p.children == " + p.children)
			           			if(p.children == undefined){
			           				p.children = new Array();
			           			}
			           			p.children.push(run_list[i])
			           			findChildren(run_list[i])
			           			
			           		}
			           	}
			           }
	        	
	       			 findChildren(run_list[0]);
	       			 console.log(tree);
	       			 
	       			  for(var x = 0; x < run_list.length;x++){
			        	if(run_list[x].parent == "basin"){
			        		if(run_list[x].basinid == basinId){
			        			tree.children.push(run_list[x]);
	
			        		};
			        	}
			        }
			        
	
					
					console.log("WRITING INFORMATION TO "+ "/home/node.js/users/" + username + "/data.json" )
					var file = "/home/node.js/users/" + username + "/data.json";
					fs.writeFile(file, JSON.stringify(tree), function (err){
						if(err){
							console.log(err)
							console.log("ERROR WRITING DATA FILE")
							res.json({message:"ERROR WRITING FILE: " + err})
						}
					})
					res.json({ 'user' : req.body });
				}
				
				
			}
			
			
		})
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
    console.log(user);
    
    user.findUser(user.name);
    res.redirect('/streams');
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

