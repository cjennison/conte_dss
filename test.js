var http = require('http');
var step = require('step');
var fs   = require('fs');

// Options.
var options = {
	host: 'streamstatsags.cr.usgs.gov',
	path: '/ss_ws_92/Service.asmx/getStreamstats?x=-72.43307&y=42.39019&inCRS=EPSG:6.6:4326&StateNameAbbr=MA&getBasinChars=C&getFlowStats=C&getGeometry=KML&downloadFeature=False&clientID=UT%20Demo'
	//    path: '/'
};

console.log('Making HTTP request to ' + options.host + options.path);

var req_stream = http.get(options, function(res_stream) {
  
	console.log('Got response: ' + res_stream.statusCode);
	var kmldata = '';
	res_stream.on('data', function(chunk) {
	  kmldata += chunk.toString();
	});
	
	res_stream.on('end', function (args) {
		fs.writeFile('streams.kml', kmldata, function (err) {
			if (err) throw err;
			console.log('streams.kml saved.');
		})
	});
	
}).on('error', function(e) {
	console.log('Got error: ' + e.message);
});

console.log('Returning result...');
req_stream.end();

