var fs    = require('fs');
var spawn = require('child_process').spawn;

var log = [];

function WeatherModel(config) {
  this.config = config;
}

// The exec method invokes the weather model.
WeatherModel.prototype.exec = function (req, res) {
  // Create a session variable called log to maintain
  // messages to be transfered back to client when
  // requested.
  req.session.log = [];

  var prec1 = req.query.prec1;
  var prec2 = req.query.prec2;
  var tempc = req.query.tempc;

  // Set response mime type:
  res.contentType('application/json');

  if (!prec1 || !prec2 || !tempc) {
    res.send({
      status  : 1,
      message : 'Missing query parameters'
    });
  }
  else {
    var child = spawn('Rscript', ['Main.R', prec1, prec2, tempc],
                      { cwd : this.config.RScript.Home });

    child.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    });

    child.stdout.on('data',
                    function (data) {
                      // Convert the data into a string:
                      var str = data.toString();
                      console.log(str);

                      // First check if we have an output directory:
                      var regex  = /\[(\d)\] \"output (.*)\"/;
                      var result = regex.exec(str);

                      function mvError (err) {
                        if (err) {
                          console.log(err);
                        }
                      }

                      if (result !== null) {
                        var frombase = this.config.RScript.FromImages + '/' + result[2];
                        var tobase   = this.config.RScript.ToImages + '/' + result[2];
                        console.log(frombase);
                        console.log(tobase);
                        fs.rename(frombase, tobase, mvError);
                        var url1 = 'images/models/' + result[2] + '/StocStrFlow.png';
                        var url2 = 'images/models/' + result[2] + '/StocStrTemp.png';
                        var url3 = 'images/models/' + result[2] + '/StocWeather.png';
                        req.session.log.push({ type : 'image', url : url1 });
                        req.session.log.push({ type : 'image', url : url2 });
                        req.session.log.push({ type : 'image', url : url3 });
                        req.session.save();
                        return;
                      }

                      regex  = /\[(\d)\] \"(.*)\"/;
                      result = regex.exec(str);
                      if (result !== null) {
                        console.log('Adding to session log: ' + result[2]);
                        req.session.log.push({ type : 'info', message : result[2] });
                        req.session.save();
                        return;
                      }
                    });

    child.stdout.on('end',
                    function (data) {
                      console.log('end: ' + data);
                    });

    child.on('exit', function (code, signal) {
      for (var i = 0; i < req.session.log.length; i++) {
        console.log('weather log: ' + req.session.log[i]);
      }

      req.session.log.push({ type : 'complete' });
      req.session.save();
    });

    res.send({
      status  : 0,
      message : 'Weather Model Running'
    });
  }
};

// The status method responds to a clients request with
// the current status of the executing weather model. If
// the model has not completed executing it either responds
// with an informational message, an image to display,
// complete if the model is finished, or nothing if there
// is no change.
WeatherModel.prototype.status = function (req, res) {
  console.log('session log on status request:');
  for (var i = 0; i < req.session.log.length; i++) {
        console.log('  weather log: ' + req.session.log[i]);
  }

  // Set response mime type:
  res.contentType('application/json');

  if (req.session.log.length >= 1) {
    res.send(req.session.log.shift());
    req.session.save();
  }
  else {
    res.send({ type : 'empty' });
  }
};

exports.weatherModel = function (config) {
  return new WeatherModel(config);
};

exports.weather_model_exec = function (req, res) {
  // Create a session variable called log to maintain
  // messages to be transfered back to client when
  // requested.
  req.session.log = [];

  var prec1 = req.query.prec1;
  var prec2 = req.query.prec2;
  var tempc = req.query.tempc;

  // Set response mime type:
  res.contentType('application/json');
  
  if (!prec1 || !prec2 || !tempc) {
    res.send({
      status  : 1,
      message : 'Missing query parameters'
    });
  }
  else {
    var child = spawn('Rscript', ['Main.R', prec1, prec2, tempc],
                      { cwd : '/home/austin/WebStuff' });

    child.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    });
    
    child.stdout.on('data',
                    function (data) {
                      // Convert the data into a string:
                      var str = data.toString();
                      console.log(str);

                      // First check if we have an output directory:
                      var regex  = /\[(\d)\] \"output (.*)\"/;
                      var result = regex.exec(str);

                      function mvError (err) {
                        if (err) {
                          console.log(err);
                        }
                      }

                      if (result !== null) {
                        var frombase = '/home/austin/WebStuff/Images/' + result[2];
                        var tobase   = '/home/node.js/streams/public/images/models/' + result[2];
                        console.log(frombase);
                        console.log(tobase);
                        fs.rename(frombase, tobase, mvError);
                        var url1 = 'images/models/' + result[2] + '/StocStrFlow.png';
                        var url2 = 'images/models/' + result[2] + '/StocStrTemp.png';
                        var url3 = 'images/models/' + result[2] + '/StocWeather.png';
                        var url4 = 'images/models/' + result[2] + '/Stoc_Fish.png';
                        req.session.log.push({ type : 'image', url : url1 });
                        req.session.log.push({ type : 'image', url : url2 });
                        req.session.log.push({ type : 'image', url : url3 });
                        req.session.log.push({ type : 'image', url : url4 });
                        req.session.save();
                        return;
                      }

                      regex  = /\[(\d)\] \"(.*)\"/;
                      result = regex.exec(str);
                      if (result !== null) {
                        console.log('Adding to session log: ' + result[2]);
                        req.session.log.push({ type : 'info', message : result[2] });
                        req.session.save();
                        return;
                      }
                    });

    child.stdout.on('end',
                    function (data) {
                      console.log('end: ' + data);
                    });

    child.on('exit', function (code, signal) {
      for (var i = 0; i < req.session.log.length; i++) {
        console.log('weather log: ' + req.session.log[i]);
      }

      req.session.log.push({ type : 'complete' });
      req.session.save();
    });
    
    res.send({
      status  : 0,
      message : 'Weather Model Running'
    });
  }
};

exports.weather_model_status = function (req, res) {
  console.log('session log on status request:');
  console.log('length: ' + req.session.log.length);
  for (var i = 0; i < req.session.log.length; i++) {
        console.log('  weather log: ' + JSON.stringify(req.session.log[i]));
  }

  // Set response mime type:
  res.contentType('application/json');

  if (req.session.log.length >= 1) {
    res.send(req.session.log.shift());
    req.session.save();
  }
  else {
    res.send({ type : 'empty' });
  }
}