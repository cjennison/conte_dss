var sio = require('socket.io');
var fs  = require('fs');
//var streamstat = require('../streamstat');

function getDrainId (kmldata) {
  var re    = /DrainID = (\d+)/g;
  var match = re.exec(kmldata);
  return match[0];
}

// A library for streams communication.
exports.listen = function (app) {
  var io = sio.listen(app);

  // Reduce logging information.
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {

    socket.on('marker', function (data) {
      console.log('received marker message: ' + data);
      var url = streamstat.make(data);
      url.fetch(function (error, kmlpath, props) {
        if (error) {
          // If there is an error, the message will be the
          // second argument in the arguments array:
          console.log('Error: ' + arguments[1]);
          socket.emit('kmlerror', { error: true,
                                    msg  : arguments[1] });
        }
        else {
          console.log('kml file downloaded. notifying client.');
          socket.emit('kmldone', { error   : false,
                                   kmlpath : kmlpath,
                                   props   : props,
                                   lat     : data.lat,
                                   lng     : data.lng });
        }
      });
    });

  });
};