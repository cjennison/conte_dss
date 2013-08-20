<?phpif($_POST['x']!=''){
	
	$txt1 = "http://streamstatsags.cr.usgs.gov/ss_ws_92/Service.asmx/getStreamstats?x=";
	$txt2 = "&y=";
	$txt3 ="&inCRS=EPSG:6.6:4326&StateNameAbbr=MA&getBasinChars=CR&getFlowStats=False&getGeometry=KML&downloadFeature=False&clientID=MA%20Demo";
	$txt4 = $txt1 . $_POST["x"] . $txt2 . $_POST["y"] . $txt3;
	$xml = file_get_contents($txt4);
	//echo $xml;
	file_put_contents('streamstats.xml', $xml);
	
}
?>

<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <style type="text/css">
      html { height: 100% }
      body { height: 100%; margin: 0; padding: 0 }
      #map_canvas { height: 100% }
	  #xpoint, #ypoint {}
    </style>
    <script type="text/javascript"
      src="http://maps.googleapis.com/maps/api/js?key=AIzaSyBO6eX__TADOG-bPPazNSWG1vp89mHspo8&sensor=false">
    </script>
    <script type="text/javascript">
      function initialize() {
		 document.getElementById("frm1").reset(); 
        var myOptions = {
          center: new google.maps.LatLng(42,-72),
         zoom: 5,
          mapTypeId: google.maps.MapTypeId.TERRAIN
        };
	var ctaLayer = new google.maps.KmlLayer('http://austin.polebitski.com/NALCC/streamstats.xml');
	ctaLayer.setMap(map);   
        var map = new google.maps.Map(document.getElementById("map_canvas"),
            myOptions);
	//var ctaLayer = new google.maps.KmlLayer('http://streamstatsags.cr.usgs.gov/ss_ws_92/Service.asmx/getStreamstats?x=-72.47742986679077&y=42.378645032058564&inCRS=EPSG:6.6:4326&StateNameAbbr=MA&getBasinChars=C&getFlowStats=C&getGeometry=KML&downloadFeature=False&clientID=MA%20Demo');
	 
	google.maps.event.addListener(map, "click", function(event)
		{
    		marker_Click = new google.maps.Marker({
                    map: map,
                    position: event.latLng,
	      			draggable: true
                });

            var Pointlatlong = event.latLng;
			document.getElementById('Pointlatlong').value = event.latLng.toString();

	     
		var ypoint = event.latLng;
		var xpoint = event.latLng;
		document.getElementById('ypoint').value = event.latLng.lat().toString();
		document.getElementById('xpoint').value = event.latLng.lng().toString();

	});	
	}
  </script>
</head>
  <body onLoad="initialize()">
    <div id="map_canvas" style="width:100%; height:100%"></div>
  	<br>
  	Lat and Lng:<input id="Pointlatlong" name="Pointlatlong" type="text" size="40" value="" /><p>
<form action="maps.php" id="frm1" method="post">
Lat:<input id="ypoint" name="y" type="text" size="10" value="" /><p>
Lon:<input id="xpoint" name="x" type="text" size="10" value="" /><p>
<input type="submit" />
</form> 
	</body>
</html>