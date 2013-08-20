var GMap = (function init() {
  // Shorthand to access google maps:
	var Map        = google.maps.Map;
  var LatLng     = google.maps.LatLng;
  var InfoWindow = google.maps.InfoWindow;
  var KmlLayer   = google.maps.KmlLayer;

  // Some useful objects:
  var geocoder = new google.maps.Geocoder();
  var event    = google.maps.event;

  return {
    map: function (mapcanvas, options) {
      return new Map(mapcanvas, options);
    },

    latlng: function (lat, lng) {
      return new LatLng(lat, lng);
    },

    marker: function (latlng, gmap, title) {
      return new google.maps.Marker({
        position: latlng,
        map     : gmap,
        title   : title
      });
    },

    marker2: function (latlng, title) {
      return new google.maps.Marker({
        position: latlng,
        title   : title
      });
    },

    info: function (map, marker, content) {
      var infoWindow = new InfoWindow();
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
      return infoWindow;
    },

    // Created this version of info in order to support new basin
    // object. This should be merged into the above info function
    // when this work is complete.
    info2: function () {
      var options = {
        disableAutoPan: false
        ,maxWidth: 20
        ,pixelOffset: new google.maps.Size(-140, 0)
        ,zIndex: null
        ,boxStyle: {
          background: "url('http://www.garylittle.ca/map/artwork/tipbox.gif') no-repeat"
          ,opacity: 0.60
          ,width: "180px"
        }
        ,closeBoxMargin: "10px 2px 2px 2px"
        ,infoBoxClearance: new google.maps.Size(1, 1)
        ,isHidden: false
        ,pane: "floatPane"
        ,enableEventPropagation: false
      };
      //return new InfoWindow();
      return new InfoBox(options);
    },

    kml: function (map, location) {
      return new KmlLayer(location,
                          { preserveViewport: false,
                            map: map });
    },

    state: function (latlng, cb) {
      geocoder.geocode({ 'latLng' : latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          // Search for state short name:
          for(var ix=0; ix< results[0].address_components.length; ix++) {
            if (results[0].address_components[ix].types[0] == "administrative_area_level_1")
            {
              cb(results[0].address_components[ix].short_name);
            }
          }
        }
        else {
          throw status;
        }        
      });
    },

    event: event,
    
    maptype: google.maps.MapTypeId
  };

})();

