var fs = require('fs');
var archiver = require('archiver');


function zipFile (directory){
	var outputFile = fs.createWriteStream(directory.url + 'output.zip');
	var archive = archiver('zip');
	var file = 'testZip';
	var dir = directory.url;
	var results = [];
	var jsonData = require('/home/node.js/streams-models/r/' + directory.step + '/' + directory.step + '_dp.json');
	var scriptName = directory.settings.scriptName;

	jsonData = jsonData[scriptName];
console.log('+++++++++++++++++++++++++++++++++++')
	console.log('+++++++++++++++++++++++++++++++++++')
	console.log('+++++++++++++++++++++++++++++++++++')
	console.log('+++++++++++++++++++++++++++++++++++')
console.log(scriptName);
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
	//scriptName
	walk(dir, function(err, results){
		console.log("results length: " + results.length)
		archive.pipe(outputFile);
		for (i = 0; i < results.length; i++){
			var fileType = results[i].split('.');
			var fileName = results[i].split('/');
			fileType = fileType.pop();
			fileName = fileName.pop();
			if(jsonData == undefined){return;};
			for (j = 0; j < jsonData.length; j++){
				if (fileName == jsonData[j].output_file){					
					if (fileName != 'output.zip'){
						fileName = jsonData[j].alias;			
						archive.append(fs.createReadStream(results[i]), { name: fileName + '.' + fileType})					
						archive.finalize(function(err, written) {
							 if (err) {
							   throw err;
							 }
						});
					}
				}
			}
		}
	})
	
	
	archive.on('error', function(err){
		throw err;
	});
}



exports.zipFile = zipFile;