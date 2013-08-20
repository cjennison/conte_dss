var Streams = {
	 yearRange: 30,
  // A constructor function to create Streams objects:
	make: function(options) {

    // Validate input arguments:
		if (! (options.x && options.y && options.state)) {
			throw 'Invalid options: x, y, and state required.';
		}

    // Set host, path, and arguments:
		var host  = options.host || 'http://streamstatsags.cr.usgs.gov';
		var path  = options.path || '/ss_ws_92/Service.asmx/getStreamstats';
    var x     = options.x;
    var y     = options.y;
    var crs   = options.crs || 'EPSG:6.6:4326';
    var state = options.state;
    var basin = options.basin || 'C';
    var flow  = options.flow || 'C';
    var geom  = options.geom || 'KML';
    var downl = options.downl || 'False';
    var cid   = options.cid || 'UT Demo';
   

    // Create the URL:
    var url = '?' +
      'x=' + options.x +
      '&y=' + options.y +
      '&inCRS=' + options.crs +
      '&StateNameAbbr=' + options.state +
      '&getBasinChars=' + options.basic +
      '&getFlowStats=' + options.flow +
      '&getGeometry=' + options.geom +
      '&downloadFeature=' + options.downl +
      '&clientID=' + options.cid;

    // Construct the Streams instance:
    return {
      getURL: function () {
        return url;
      }
    };

	}
};

