function init() {
//********OpenLayers Map**********
        bounds = new OpenLayers.Bounds(-2493045, 177285, 2342655, 3310005);

        options = {controls: [], allOverlays: true, maxExtent: bounds, maxResolution: 'auto', maxScale: 20000000, minScale: 1000, numZoomLevels: 30, projection: "EPSG:5070", units: 'm'};

        map = new OpenLayers.Map('map', options);

//********WMS layers**********
        landCov = new OpenLayers.Layer.WMS( "Land Cover",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:lan_cov_06', format: "image/png", transparent: true}
            );

        surfLith = new OpenLayers.Layer.WMS( "Surficial Lithology",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:surf_lith_10', format: "image/png", transparent: true}
            );

        /*landCov = new OpenLayers.Layer.WMS( "Land Cover",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:lan_cov_06', format: "image/png", transparent: true}, 
            {attribution: "<img src='images/Land_Cover_2006_Legend.jpg'/>"}
            );*/

        elevation = new OpenLayers.Layer.WMS( "Elevation",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:ned_10_EBTJV', format: "image/png", transparent: true} 
            );

        baseFlow = new OpenLayers.Layer.WMS( "Base Flow Index",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:base_flow_03', format: "image/png", transparent: true} 
            );

        precip = new OpenLayers.Layer.WMS( "Mean Precipitation",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:precip_1981_2010', format: "image/png", transparent: true} 
            );

        tempMax = new OpenLayers.Layer.WMS( "Mean Maximum Temperature",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:temp_max_1981_2010', format: "image/png", transparent: true} 
            );

        tempMin = new OpenLayers.Layer.WMS( "Mean Minimum Temperature",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:temp_min_1981_2010', format: "image/png", transparent: true} 
            );

        no3dep = new OpenLayers.Layer.WMS( "NO3 Deposition",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:no3_dep_11', format: "image/png", transparent: true}
            );
        
        so4dep = new OpenLayers.Layer.WMS( "SO4 Deposition",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:so4_dep_11', format: "image/png", transparent: true}
            );

        canCov = new OpenLayers.Layer.WMS( "Canopy Cover",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:can_cov_01', format: "image/png", transparent: true} 
            );

        solGain = new OpenLayers.Layer.WMS( "Solar Gain",
             ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:solar_gain1', format: "image/png", transparent: true} 
            );

        impSur = new OpenLayers.Layer.WMS( "Impervious Surface",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:imp_sur_06', format: "image/png", transparent: true} 
            );

        USstates = new OpenLayers.Layer.WMS( "US States",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:US_States', format: "image/png", transparent: true} 
            );

        states = new OpenLayers.Layer.WMS( "EBTJV States",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:EBTJV_States', format: "image/png", transparent: true} 
            );

        rivers = new OpenLayers.Layer.WMS( "Major Rivers",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:US_Rivers', format: "image/png", transparent: true} 
            );

        streams = new OpenLayers.Layer.WMS( "Streams",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:NHDPlus2_Streams_Clipped', format: "image/png", transparent: true} 
            );

        corridor = new OpenLayers.Layer.WMS( "100 M Stream Corridor",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:EBTJV_NHD_corridor', format: "image/png", transparent: true} 
            );

        waterbodies = new OpenLayers.Layer.WMS( "Waterbodies",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:NHDPlus_Waterbodies', format: "image/png", transparent: true} 
            );

        primRoads = new OpenLayers.Layer.WMS( "Primary Roads",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:US_Primary_Roads_2012', format: "image/png", transparent: true} 
            );

        secRoads = new OpenLayers.Layer.WMS( "Secondary Roads",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:US_Secondary_Roads_2012', format: "image/png", transparent: true} 
            );

        boundary = new OpenLayers.Layer.WMS( "EBTJV Boundary",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:EBTJV_Boundary', format: "image/png", transparent: true} 
            );

        chesBay = new OpenLayers.Layer.WMS( "Chesapeake Bay Boundary",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:Chesapeake_Bay_Boundary', format: "image/png", transparent: true} 
            );

        huc6 = new OpenLayers.Layer.WMS( "HUC 6",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:HUC_6', format: "image/png", transparent: true} 
            );

        huc8 = new OpenLayers.Layer.WMS( "HUC 8",

            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:HUC_8', format: "image/png", transparent: true} 
            );

        huc10 = new OpenLayers.Layer.WMS( "HUC 10",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:HUC_10', format: "image/png", transparent: true} 
            );

        huc12 = new OpenLayers.Layer.WMS( "HUC 12",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:HUC_12', format: "image/png", transparent: true} 
            );

        catchments = new OpenLayers.Layer.WMS( "NHDPlus Catchments",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:NHDPlus_Catchments', format: "image/png", transparent: true} 
            );

        patches = new OpenLayers.Layer.WMS( "BKT Patches",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:BKT_Patches', format: "image/png", transparent: true} 
            );

        vulPatches = new OpenLayers.Layer.WMS( "BKT Patch Vulnerability",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:Patch_Vulnerability_2005', format: "image/png", transparent: true} 
            );

        dams = new OpenLayers.Layer.WMS( "Dams",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:NABD_2012_Clipped', format: "image/png", transparent: true} 
            );

        mines = new OpenLayers.Layer.WMS( "Mines",
            ["http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms","http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms"], 
            {layers: 'EBTJV:Mines_2003', format: "image/png", transparent: true} 
            );
 	

//********WFS layers**********
	/*patchesWFS = new OpenLayers.Layer.Vector(
           "WFS Patches", {
           strategies: [new OpenLayers.Strategy.BBOX()],
           protocol: new OpenLayers.Protocol.WFS({
             url: "http://felek.cns.umass.edu:8080/geoserver/EBTJV/wfs",
             featureType: "BKT_Patches",
             featureNS: "http://localhost:8090/geoserver/EBTJV"
             })
           });

        damsWFS = new OpenLayers.Layer.Vector(
           "WFS dams", {
           strategies: [new OpenLayers.Strategy.BBOX()],
           protocol: new OpenLayers.Protocol.WFS({
             url: "http://felek.cns.umass.edu:8080/geoserver/EBTJV/wfs",
             featureType: "NABD_2012_Clipped",
             featureNS: "http://localhost:8090/geoserver/EBTJV"
             })
           });*/

//*******Set initial visibility*******
	surfLith.setVisibility(false);
	elevation.setVisibility(false);
        baseFlow.setVisibility(false);
        precip.setVisibility(false);
	tempMax.setVisibility(false);
	tempMin.setVisibility(false);
        no3dep.setVisibility(false);
	so4dep.setVisibility(false);
        canCov.setVisibility(false);
        solGain.setVisibility(false);
	corridor.setVisibility(false);
	primRoads.setVisibility(false);
	secRoads.setVisibility(false);
	impSur.setVisibility(false);
	chesBay.setVisibility(false);
	huc6.setVisibility(false);
	huc8.setVisibility(false);
	huc10.setVisibility(false);
	huc12.setVisibility(false);
	catchments.setVisibility(false);
        patches.setVisibility(false);
	vulPatches.setVisibility(false);
        dams.setVisibility(false);
	mines.setVisibility(false);


        map.addLayers([landCov, surfLith, elevation, baseFlow, precip, tempMin, tempMax, no3dep, so4dep, canCov, solGain, impSur, USstates, states, boundary, chesBay, huc6, huc8, huc10, huc12, catchments, rivers, streams, waterbodies, corridor, primRoads, secRoads, patches, vulPatches, dams, mines]);

//******Map Controls*******
	extPanel = new OpenLayers.Control.Panel({div: document.getElementById('panel')});
	map.addControl(extPanel);

	control_zoom_in = new OpenLayers.Control.ZoomIn({title: "Fixed Zoom In"});
	control_zoom_out = new OpenLayers.Control.ZoomOut({title: "Fixed Zoom Out"});
	maxExtent = new OpenLayers.Control.ZoomToMaxExtent({title: "Zoom to Max Extent"});
	zoomBox = new OpenLayers.Control.ZoomBox({title: "Zoom In Select"});
	zoomBoxOut = new OpenLayers.Control.ZoomBox({title: "Zoom Out Select", out: true, displayClass: 'olControlZoomBoxOut'});
	navPan = new OpenLayers.Control.Navigation({title: "Pan", dragPanOptions: {enableKinetic: true}, zoomWheelEnabled: true, documentDrag: true});
	identify = new OpenLayers.Control.WMSGetFeatureInfo({title: "Identify", url: "http://felek.cns.umass.edu:8080/geoserver/EBTJV/wms", queryVisible: true, 
		eventListeners: {
			getfeatureinfo: function(event) {
			map.addPopup(new OpenLayers.Popup.Anchored(
			"attributes", 
			map.getLonLatFromPixel(event.xy),
 			new OpenLayers.Size(400,200),
			event.text,
			null,
			true
			), true);
                	}
			}
		});

	download = new OpenLayers.Control.Button({title: "Download Layers", displayClass: "olControlDownload", trigger: getDownload});

	navHistory = new OpenLayers.Control.NavigationHistory({displayClass: 'olControlNavHist'});
	navHistory.previous.title = "Previous Extent";
	navHistory.next.title = "Next Extent";

	map.addControl(control_zoom_in);
	map.addControl(control_zoom_out);
	map.addControl(maxExtent);
	map.addControl(zoomBox);
	map.addControl(zoomBoxOut);
	map.addControl(navPan);
	map.addControl(navHistory);
	map.addControl(identify);
	map.addControl(download);

	extPanel.addControls([control_zoom_in, control_zoom_out, maxExtent, zoomBox, zoomBoxOut, navPan, navHistory.previous, navHistory.next, identify, download]);
	
	navPan.deactivate();
	navPan.activate();

	ls = new OpenLayers.Control.LayerSwitcher({title: "Add/remove layers", div: document.getElementById("legend")});
	ls.useLegendGraphics = true;
	map.addControl(ls);

	//map.addControl(new OpenLayers.Control.NavToolbar());
        //map.addControl(new OpenLayers.Control.PanZoom());
        //map.addControl(new OpenLayers.Control.LayerSwitcher({title: "Add/remove layers", div: document.getElementById("legend")}));
        //map.addControl(new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}, zoomWheelEnabled: true}));
        map.addControl(new OpenLayers.Control.Attribution());
        map.addControl(new OpenLayers.Control.ArgParser());
        map.addControl(new OpenLayers.Control.MousePosition({div: document.getElementById("location")}));
        map.addControl(new OpenLayers.Control.ScaleLine({div: document.getElementById("scaleline-id")}));
        map.addControl(new OpenLayers.Control.Scale("scale-id"));
        map.addControl(new OpenLayers.Control.NavigationHistory());
        //map.addControl(new OpenLayers.Control.KeyboardDefaults());
	//map.addControl(new OpenLayers.Control.Graticule());

        map.zoomToExtent(bounds);
        //map.setOptions({restrictedExtent: bounds});
}