$(function() {
  ////// UI Initialization //////
  $("#accordion").accordion({ header : "h3",
                              fillSpace : true });
  $('#inst').resizable();
  $('#inst').draggable();
  
  
  // Run web sockets:
  var socket    = io.connect();
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

  var gadges = new google.maps.KmlLayer('http://livestreams.herokuapp.com/GagesUsed.kmz',
                                        { preserveViewport :  true,
                                          clickable : true });
  gadges.setMap(map);
  var ct_watershed = new google.maps.KmlLayer('http://livestreams.herokuapp.com/ct_watershed.kmz',
                                              { preserveViewport :  true,
                                                clickable : false });
  ct_watershed.setMap(map);

  var fortRiver = new google.maps.KmlLayer('http://livestreams.herokuapp.com/Fort_River.kml',
                                           { preserveViewport : true,
                                             clickable : true });
  fortRiver.setMap(map);
  google.maps.event.addListener(fortRiver, 'click', function (event) {
    console.debug(event);
  });

  GMap.event.addListener(map, 'rightclick', function (event) {
    var m = GMap.marker2(event.latLng, '');
    var b = Basin.basin($, GMap, map, m, socket);
    return false;
  });
});
