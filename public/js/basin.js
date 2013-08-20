/* The Basin module represents all those things that one might
 * want to do with a basin. 
 */
var Basin = (function init () {
  // This is used to disable event handlers when
  // a basin lookup is in progress. We want to disable
  // the selection of another basin when a lookup is
  // in progress.
  var disableHandlers = false;

  // Keeps track of basins.
  // NOTE: Do we need this? Do we ever need to consult this table?
  var basinTable  = {};

  // The next basin id:
  var nextBasinId = 0;

  function nextId () {
    return nextBasinId+=1;
  }

  function addBasin (basin) {
    basinTable[basin.getId()] = basin;
  }
  
  // Return an object representing the Basin module:
  return {
    
    // The basin function is used to initiate a basin process:
    basin: function ($, GMap, map, marker, socket) {
      // Return if a basin lookup is in progress:
      if (disableHandlers)
        return;

      // Reference to some useful DOM nodes to speed
      // things up a bit rather than search DOM each time.
      var prompt  = $('div#prompt');
      var ldrmsg  = $('div#loader > #msg');
      var rscript = $('div#rscript');

      // Disable handlers:
      disableHandlers = true;

      // Display the marker:
      marker.setMap(map);
      
      var info     = GMap.info2();         // Create the InfoWindow.
      var position = marker.getPosition(); // Get the marker position.

      // Select the next basin id:
      var basin_id = nextId();

      console.log('created basin object ' + basin_id);
      
      // The initial basin object:
      var basin = {
        getId  : function () { return basin_id; },
        jquery : $,
        map    : map,
        marker : marker,
        socket : socket,
        info   : info
      };

      // Add the basin to the basin table:
      addBasin(basin);

      // This resets the prompt view to select another basin:
      function resetPrompt () {
        disableHandlers = false;
        prompt.empty();
        rscript.empty();
      }
      
      // This function sends a message to the server to initiate a
      // KML download from streamstats.
      function request_kml () {
        GMap.state(position, function (state_name) {
          socket.emit('marker', { state : state_name,
                                  lat   : position.lat(),
                                  lng   : position.lng() });
        });
      }

      // This function displays the initial loading messages
      // when a point on the map is clicked to select a basin.
      function retrieve_info () {
        var loader = $('div#loader > #msg');        
        var lat    = position.lat().toPrecision(4);
        var lng    = position.lng().toPrecision(4);

        loader.append('Loading basin (~1min) at ' +
                      lat + ', ' +
                      lng);
        loader.append('<img src="images/ajax-loader.gif"/>');

        info.setContent('<div class="infowindow">Retrieving data...</div>');
        info.open(map, marker);
        console.log("is this happening twice?");
      }

      // This function is invoked when the KML data has been
      // loaded from the streamstats web service.
      function receive_kml (data) {
        var ldr  = $('div#loader > #msg');
        ldr.fadeOut('slow', function () { });

        // Close the info window:
        info.close();
        // Layer the KML object onto the map:
        var loc = 'http://' + document.location.host + '/' + data.kmlpath;
        var kml = GMap.kml(map, loc);
        // Save kml object in the basin object:
        basin.kml = kml;
        // Save the drainage model URL in the basin object:
        basin.drainage_url = data.props.drainId;
        // Remove marker:
        marker.setMap(null);
        // Verify basin:
        verify_basin();
      }

      // This function is invoked when there is an error loading the
      // KML file from the streamstats website. It is called typically
      // when the streamstats service is unavailable.
      function kml_error (data) {
        var ldr  = $('div#loader > #msg');
        ldr.fadeOut('slow', function () { });
        basin.info.close();
        basin.marker.setMap(null);
        $('div#prompt').append('<p class="error">Error: ' + data.msg + '</p>');
        console.log(data.msg);
        disableHandlers = false;
      }

      // This function prompts the user when the basin is overlayed onto
      // the google map. It asks the user if this is the basin they
      // are interested in.
      function verify_basin () {
        var p1 = $('<p>Is this the basin you wanted?</p>' +
                   '<p><a id="p1-yes" href="">Yes</a> or ' +
                   '<a id="p1-no" href="">No</a></p>');

        $('div#prompt').html(p1);
        
        $(p1).find('#p1-yes').click(function (event) {
          event.preventDefault();
          select_model();
        });

        $(p1).find('#p1-no').click(function (event) {
          event.preventDefault();
          resetPrompt();
          // TODO: do I remove the basin from the display?
        });
      }

      // This function prompts the user to select model to run and
      // displays the results in the prompt view.
      function select_model () {
        var p2 = $('<p>Please choose a model to run:</p>' +
                   '<form>' +
                   '<input type="radio" name="model" id="p2-drainage">Drainage</input><br/>' +
                   '<input type="radio" name="model" id="p2-other">Other Model</input><br/>' +
                   '</form>' +
                   '<p>Or choose a <a href="" id="p2-newbasin">new basin</a>.</p>');
        $('div#prompt').html(p2);

        $(p2).find('#p2-drainage').click(function (event) {
          var url = basin.drainage_url;
          console.log('Drainage URL: ' + url);
          rscript.empty();
          rscript.hide();
          rscript.append(url);
          rscript.fadeIn('slow', function () {})
        });

        $(p2).find('#p2-newbasin').click(function (event) {
          event.preventDefault();
          resetPrompt();
        });
        
        // Allow the map to be clicked again:
        disableHandlers = false;
      }
      
      


      //// The Main Driver ////
      socket.on('kmldone', receive_kml);
      socket.on('kmlerror', kml_error);
      retrieve_info();
      request_kml();
      
      // Return the basic object. Not sure this is useful, but perhaps it
      // will be in the future.
      return basin;
    }
    
  }
})();
