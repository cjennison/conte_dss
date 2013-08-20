$(function() {
  ////// UI Initialization //////
  $("#accordion").accordion({ header : "h2",
                              fillSpace : true });
  $('#inst').resizable();
  $('#inst').draggable();

  // Run web sockets:
  var socket = io.connect();

  var mapcanvas = $('div#map')[0];

  // Options for the default map to display.
  // TODO: where should the initial map display?
  var options = {
    center : GMap.latlng(42.39019, -72.43307),
    zoom : 17,
    mapTypeId : google.maps.MapTypeId.TERRAIN,

    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_CENTER
    },
    panControl: false,
    panControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.TOP_LEFT
    },
    scaleControl: true,
    scaleControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER
    },
    streetViewControl: false,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    }
  };

  // Construct the map:
  var map = GMap.map(mapcanvas, options);

  // Global info window to be used to display loading status:
  var loadingInfo;

  var gadges = new google.maps.KmlLayer('http://livestreams.herokuapp.com/GagesUsed.kmz',
                                        { preserveViewport :  true,
                                          clickable : true });
  gadges.setMap(map);
  var ct_watershed = new google.maps.KmlLayer('http://livestreams.herokuapp.com/ct_watershed.kmz',
                                              { preserveViewport :  true,
                                                clickable : false });
  ct_watershed.setMap(map);

  // Click event on the map. This adds a marker on the clicked
  // location. It will also send an Ajax call to the server to
  // initiate the downloading of the KML file.
  
  GMap.event.addListener(map, 'rightclick', function (event) {
    // Create a new marker and add it to the map:
    var marker = GMap.marker(event.latLng, map, '');

    // Set the latitude/longitude:
    var lat = $('span#lat');
    var lng = $('span#lng');
    lat.html(event.latLng.lat());
    lng.html(event.latLng.lng());
    
    loadingInfo = GMap.info(map, marker,
                            '<b>Retrieving from stream stats @ ' +
                            lat.html() + ', ' + lng.html() + '</b>');

    GMap.state(event.latLng, function (name) {
      socket.emit('marker', { 'state' : name,
                              'lat'   : event.latLng.lat(),
                              'lng'   : event.latLng.lng() });
    });

  });

  socket.on('kmldone', function (data) {
    var loc = 'http://' + document.location.host + '/' + data.kmlpath;
    console.log('layering ' + loc);
    var geoRssLayer = new google.maps.KmlLayer(loc, { preserveViewport :  true });
    console.log('Setting geoRssLayer');
    
    // Close the info window:

    // Comment this out until further notice...
    //    loadingInfo.close();

    geoRssLayer.setMap(map);
    
    console.log('Drain ID = ' + data.props.drainId);

    // RScript support:
    var rscript = $('div#rscript');
    rscript.empty();
    rscript.hide();
    rscript.append(data.props.drainId);
    setTimeout(function () {
      rscript.fadeIn('slow', function () {});
    }, 1000);

    // Move marker to basin coordinates:
    // TODO: need to add tables to map IDs to markers to keep track of
    // the markers between callbacks.

    // Set center
    //var latlng = GMap.latlng(data.lat, data.lng);
    //map.setZoom(14);
    //map.setCenter(latlng);
  });


  ///// Prompt Stuff /////

  var inst = $('div#prompt');

  function step1 () {
    var handler = GMap.event.addListener(map, 'click', function (event) {
      var lat = $('span#lat');
      var lng = $('span#lng');
      lat.html(event.latLng.lat());
      lng.html(event.latLng.lng());

      // Create a new marker and add it to the map:
      var marker = GMap.marker(event.latLng, map, '');
    
      loadingInfo = GMap.info(map, marker,
                              '<b>Retrieving from stream stats @ ' +
                              lat.html() + ', ' + lng.html() + '</b>');

      GMap.state(event.latLng, function (name) {
        socket.emit('marker', { 'state' : name,
                                'lat'   : event.latLng.lat(),
                                'lng'   : event.latLng.lng() });
      });

      GMap.event.removeListener(handler);
      step2(marker);
    });
    inst.html('<p>Choose a point to delineate the basin.</p>');
  }

  function step2 () {
    inst.append('<p>Is this the basin you wanted? ' +
                '<a id="step2yes" href="">Yes</a>/' +
                '<a id="step2no"  href="">No</a></p>');
  }

  //step1();

// 1. Choose a point for delineating a basin
//   2. Is this the basin you wanted (Yes/No) - where no would bring the
//   user back to selecting a new point, if yes then go to next step
// I think step 2.5 will be a menu/check boxes that allows the user to
//   select which models will be run, right now we only have one model
// 3. A button to run the algorithm we have setup on our server now
// 4. Last step would be choice of data export and whether the user
//   wanted to do this for a new basin

});
