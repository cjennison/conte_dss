/* The Basin Application
 */
Streams.app_control.apps.basin = {
  name : 'Basin Selection',
  order: 1,
  basinTable: {},
	basin:null,
	basinId:null,
  currentBasin: undefined,
  basinThumbnail: null,
  basinTree:null,
  bypassBasin:false,
  
  getBasin : function (basinId) {
    return this.basinTable[basinId];
  },

  init : function () {
  	// Keeps track of basins.
    var basinTable  = this.basinTable;
	
	
	var debugInterval = setInterval(function(){
  		if(Streams.app_control.apps.basin.bypassBasin == true){
  			changeView("debug_name", "D3BUG");
  			clearInterval(debugInterval);
  		}
  	},100)
	
    // A basin object:
    function Basin(options) {
	console.log(options);
      if (!options.id) {
        throw 'Basin requires an id to be initialized.';
      }
      console.log("ID: " + options.id);

      // Keep a reference of the basin table:
      this.basinTable = basinTable;

      // Standard options:
      this.name = options.name || undefined;
      this.id   = options.id   || undefined;
      this.lat  = options.lat  || undefined;
      this.lng  = options.lng  || undefined;
      this.area = options.area || undefined;
	  Streams.app_control.apps.basin.basinId = this.id;
	  this.hideKmlLayer();

      // Save the URL in the Basin object:
      this.url  = 'http://' + document.location.host + 
                  '/' + options.id + '/BasinOutline.kml';
      this.flowUrl  = 'http://' + document.location.host + 
                  '/' + options.id + '/NHDplusFlowlines.kml';            
      // Load the KML object:
      
      this.thumbnail = 'http://' + document.location.host + 
                  '/' + options.id + '/basin.svg';
      
      this.kml  = Streams.map.makeKMLLayer(this.url);    
      this.flowKml = Streams.map.makeKMLLayer(this.flowUrl);  
      // Save the map:
      this.map  = Streams.map.getMap();
      // Initially the KML layer is not visible:
      this.show = false;

      // Add to the basin table:
      this.basinTable[this.id] = this;
      Streams.app_control.apps.barrier.basin = this;
      Streams.app_control.apps.basin.basin = this;
      console.log(this);
    }

    Basin.prototype.removeFromTable = function () {
      delete this.basinTable[this.id];
    };

    Basin.prototype.addToTable = function () {
      this.basinTable[this.id] = this;
    };

    Basin.prototype.showKmlLayer = function () {
      if (this.show)
        return;
      else {
        this.kml.setMap(this.map);
        this.flowKml.setMap(this.map);
        this.show = true;
      }
    };

    Basin.prototype.hideKmlLayer = function () {
    	if(this.kml == undefined){ return; }
      this.kml.setMap(null);
       this.flowKml.setMap(null);
      this.show = false;
    };

    Basin.prototype.setName = function (name) {
      this.name = name;
      $.post('/basin/user/set-alias', 
             { basin_id    : this.id,
               basin_alias : name });
    };
  	
  	/// Initialize Functionality ////

    // This is used to disable event handlers when
    // a basin lookup is in progress. We want to disable
    // the selection of another basin when a lookup is
    // in progress.
    var disableHandlers = false;

    //// Initialize View ////
    var basin_view    = $('<div id="basin-app">');
    var loader        = $('<div id="loader">');
    var message       = $('<div id="msg">');
    var prompt_header = $('<div id="prompt_header">');
    var static        = $('<div id="basin_header">');
    var prompt        = $('<div id="prompt" style="margin-top: 70px;">');
    var information   = $('<div id="info">')
    var sim_period	  = $('<div id="sim">');
    var basinList	  = $('<ul id="basinList">');
    var rscript       = $('<div id="rscript">');
    
    var basinListObject;
    
    var save_message  = $('<div id="save_message">');
	$("#basinList").css("height", "333px");

   
    
    
  	//Append Items to Basin View
    basin_view
	.append(static)
      .append(loader.append(message))
      .append(prompt_header)
      .append(prompt)
      .append(rscript)
      .append(information)
      //.append(basinList)
      .append(sim_period)
      .append(save_message);
    this.view = basin_view;
    prompt.empty();
        rscript.empty();
    
    
    //Add class to basin view
    $(basin_view).addClass("basinApplication");
   
   //Add class to basin List
   $(basinList).addClass("basinList");
   
    //Start first basin dialog
	startBasinDialog();
	
	//Load Saved Basins
	loadPredefinedBasins();
   
   function startBasinDialog(presetValue){
		static.html('<center><h2 style="color:#1C94C4">Basin</h2><br>' );
	   	prompt_header.html('  <div class="toolbar" style="margin-left: 12px;"><div class="r-btn basin active" id="new-run-button">Predefined Basins</div >' +
                     '<div class="r-btn basin" id="saved-run-button">My Saved Basins</div >' +
                     '<div class="r-btn basin " id="no-run-button">New Basin</div >' +
                  '</div>' );

		$(prompt_header).find("#new-run-button").click(function(e){
			basin_view.append(basinList)
	     				loadPredefinedBasins();
			var btns = $("#basin-app .r-btn");
			for(var i = 0;i < btns.length; i++){
				$(btns[i]).removeClass("active");
			}
			$("#basin-app #new-run-button").addClass("active");

		})
		$(prompt_header).find("#saved-run-button").click(function(e){
			basin_view.append(basinList)
	     				loadSavedBasins();
			var btns = $("#basin-app .r-btn");
			for(var i = 0;i < btns.length; i++){
				$(btns[i]).removeClass("active");
			}
			$("#basin-app #saved-run-button").addClass("active");


		})
		$(prompt_header).find("#no-run-button").click(function(e){
			console.log("NEW");
			startDelineateDialog();
			var btns = $("#basin-app .r-btn");
			for(var i = 0;i < btns.length; i++){
				$(btns[i]).removeClass("active");
			}
			$("#basin-app #no-run-button").addClass("active");

		})


		$("#basinList").css("height", "333px");
	    basinList.append('<br><center><img style="margin-right:40px" src="images/ajax-loader.gif"/>');
	
	    	$(information).empty();
	    	//$(information).append("Right Click the Map to Delineate a Basin")

	     $(".panelBackground").css("opacity", "0");
	     
	     var pred = $(prompt_header).find("#pred");
	     var saved = $(prompt_header).find("#savedgg");
	    // var delin = $(prompt_header).find("
	     
	    $(pred).button();
	     $(saved).button();
	     
	     $(saved).bind('click', function(){
	     	basin_view.append(basinList)
	     				loadSavedBasins();
	     })
	     
	     $(pred).bind('click', function(){
	     	basin_view.append(basinList)
	     				loadPredefinedBasins();
	     })
	     
	     var basinSelect = $(prompt_header).find("#basinSelectDropdown");
	     var basinLoader;
	     $(basinList).css("display", "block");
		$(basinList).css("height", "333px");

	     basinListObject = basinSelect;
       		basinList.empty();
       		
       	basin_view.append(basinList)
	     				loadPredefinedBasins();

	     if(presetValue){
	     	
	     }
	     
	     $(basinSelect).change(function(){
	     		$(information).empty();

	     		console.log($(prompt_header).find('#basinSelectDropdown option:selected').val());
	     		basinLoader = $(prompt_header).find('#basinSelectDropdown option:selected').val();
	     		
	     		switch(basinLoader){
	     			case "saved":
	     				console.log("Save");
	     				basin_view.append(basinList)
	     				loadSavedBasins();
	     				break;
	     				
	     			case "predef":
	     				console.log("Predefined");
	     				basin_view.append(basinList)
	     				loadPredefinedBasins();
	     				break;
	     				
	     			case "new":
	     				basinList.empty();
	     				$(information).append("Right Click the Map to Delineate a Basin")
	     				$(basinList).remove()
	     				break;
	     		}
	     		
	     });
     
   		//changeView("name", 'id');

   }
   //Starts Loading JSON Object from server
	function loadPredefinedBasins(){
		var json = $.get('/basin/predef');
		$(prompt).empty();
		prompt.html("<center><h3>Select a Predefined Basin.</h3></center>");
		basinList.fadeIn();	
		console.log("CHECKING PRED BASINS------------------------------");
		setTimeout(function(){console.log(json)},4000);
		checkCompletedLoad(json);
	}
	
	//Starts Loading JSON Object from server
	function loadSavedBasins(){
		var json = $.get('/basin/user/list');
		$(prompt).empty();
		prompt.html("<center><h3>Select a Basin from My Saved Bains.</h3></center>");

		basinList.fadeIn();	
		console.log("CHECKING SAVED BASINS------------------------------");
		setTimeout(function(){console.log(json)},4000);
		checkCompletedLoad(json);
	}

	function startDelineateDialog(){
		basin_view.find(basinList).remove();
		prompt.html("<center><h2 style='margin-top:10px'>Delineate New Basin</h2><p>Right click on the map to define basin upstream of selected point.</p>");
	}

	function checkMe(){
		console.log("COOL");
	}
	
	//Checks load status of jsonObject
	function checkCompletedLoad(jsonGetObject){
		setTimeout(function(){
			if(jsonGetObject.readyState == 4){
				var jsonResponse = jsonGetObject.responseText;
				jsonObj = JSON && JSON.parse(jsonResponse) || $.parseJSON(jsonResponse);
				console.log(jsonObj);
				this.clearInterval();
				displayLoadedBasins(jsonObj);
				
				
				
			} else {
				checkCompletedLoad(jsonGetObject)
			}
		}, 1000);
	}
	
	//Display Loaded Basin
	function displayLoadedBasins(jsonObj){
		basinList.empty();
		
		for (var i=0;i<jsonObj.length;i++){
			console.log(jsonObj[i]);
			
		      var itemText;
		      if (jsonObj[i].basin_alias) {
		        itemText = jsonObj[i].basin_alias + ' [' + jsonObj[i].basin_id + ']';
		      }
		      else {
		        itemText = jsonObj[i].basin_id;
		      }

			var listItem = $('<li>' + itemText + '</li>');
			$(listItem).attr("name", jsonObj[i].basin_alias);
			$(listItem).attr("id", jsonObj[i].basin_id);
			$(listItem).attr("lat", jsonObj[i].lat);
			$(listItem).attr("long", jsonObj[i].long);
			$(listItem).attr("area", jsonObj[i].area);
			
			listItem.id = jsonObj[i].basinid;
			basinList.append(listItem);	
			$(listItem).bind('mousedown', function(e){	
				console.log(e);
				loadBasin($(this).attr("name"), $(this).attr("id"), $(this).attr("lat"), $(this).attr("long"), $(this).attr("area"));
			});	
			
			
		}
	}
	
	/**
	 * Loads the Selected Basin
 	 * @param {Object} name Name of Basin
 	 * @param {Object} id Unique Id
	 */
	function loadBasin(name, id, lat, long, area){
		prompt_header.fadeIn();
		console.log(name);

	    // Look for basin in basin table or create a new one:
	    var basin;
	    if (basinTable[id]) {
	      basin = basinTable[id];
	    }
	    else {		
	      var basin = new Basin({ name : name, 
	                              id   : id,
	                              lat  : lat,
	                              lng  : long,
	                              area : area });
	
	      // Add the basin to the table of basins:
	      basinTable[basin.id] = basin;
	    }
	
	    // Show the basin layer in the map:
	    basin.hideKmlLayer();
	    basin.showKmlLayer();
	    console.log(basin);
		 
		//changeView(name, id, lat, long, area);
		$(prompt).empty();
		$(prompt_header).empty();
		basinList.fadeOut();
		sim_period.empty();
		
		
		
        //Save Basin Prompt           
        var sv = $('<br><center><h2>Choose this Basin?</h2>' + '<br />' + 
        		'<button id="yesbtn" href="">Yes</button><button id="nobtn" href="">No</button>');
        save_message.html(sv);

		$(sv).find('#nobtn').button();
        $(sv).find('#yesbtn').button();
        $(sv).find('#yesbtn').click(function (event) {
          event.preventDefault();
                    save_message.empty();

          changeView(basin);

        });
         $(sv).find('#nobtn').click(function (event) {
          basin.hideKmlLayer();
          event.preventDefault();
          save_message.empty();
		      startBasinDialog();
		      loadPredefinedBasins();
        });
		
	}
	
	/**
	 * Sets the view to the Step Selection 
 * @param {Object} name
 * @param {Object} id
 * @param {Object} lat
 * @param {Object} long
 * @param {Object} area
	 */
	function changeView(basin){
		console.log("CHANGING THE VIEW");
		Streams.map.hide();
		//Streams.app_control.initSteps();
		Streams.app_control.enableSteps(basin.name ? basin.name : basin.id);
		//basinList.empty();
		var basintree = $.post('/basin/user/gettreefrombasin', {"basinid":basin.id}).done(function(data){
			console.log(data);
		})
		
		var basininterval = setTimeout(function(){
			console.log(basintree);
			var outputTree = Output.runInformation.parseResponse(basintree.responseText);
			console.log(outputTree)
			//Chart.init("#treeContainer", "../json/data2.json", 1100, 455, 55, 70, 147, 80, 25, "output");

		},8000);
		
		
		
		prompt_header.html('<br><h2 style="margin:0"><center>Basin</h2>');
		prompt.html('<center><div class="r-btn" id="newBasin">Select New Basin</div>');
		
		//Chart.addThumbnail(basin.thumbnail);
		console.log(basin.thumbnail);
		
		$('#inputWrapper').append('<ul id="thumbnailList"></ul>');
		
		Thumbnails.buildThumbUl(); 
		//Thumbnails.buildThumbnails(1,"NEW RUN" , false, null);
		//Thumbnails.buildThumbnails(2,"NEW RUN" , false, null);
		$(".panelBackground").css("opacity", "0");
		$("#basinTitle").html = "Basin";
		sim_period.html('<br><br><br><p><center><h2>Simulation Period:</h2><p><b><span class="years">30</span> Years<br><div id="years_slider"></div>')
		var simText = $(sim_period).find(".years");
		var simSlider = $(sim_period).find("#years_slider");
		simSlider.slider(
			 { 
			max     : 80,
	        min     : 0,
	        range   : 'min',
	        value   : 30,
	        animate : 'fast',
	        slide   : function (event, ui) {
	          simText.text(ui.value);
	          Streams.yearRange = ui.value;
	          inputGraph.updateDate(ui.value);
	        }
	      }
		)
		$("#saved_basin").addClass("active");

		//Streams.app_control.addClass(".basinSelection-control", "full-height");
		
		$(prompt).find("#newBasin").bind("mousedown", function(){
			$(prompt).empty();
			$(prompt_header).empty();
			sim_period.empty();
			Streams.map.show();
			Streams.app_control.disableSteps();
			save_message.empty();
			startBasinDialog();
     		basin.hideKmlLayer();
			loadPredefinedBasins();	
			$("#thumbnailList").remove();					
		});
		
		var basinButton = $("#prompt #newBasin");
		//$(basinButton).addClass("r-btn");
		//$(basinButton).addClass("");

		//$(basinButton).button();
		$(basinButton).bind("click", function(){
			$(prompt).empty();
			$(prompt_header).empty();
			sim_period.empty();
			Streams.map.show();
			Streams.app_control.disableSteps();
			save_message.empty();
			startBasinDialog();
     		basin.hideKmlLayer();
			loadPredefinedBasins();
			$("#thumbnailList").remove();	
		});
	}
	
	
	
    //Loads Basin Delineation
    function rightClickEvent (event) {
    	resetPrompt();
    	$(information).empty();
      // Return if a basin lookup is in progress:
      if (disableHandlers)
        return;
        if(Streams.app_control.apps.basin.basin != null){
      		Streams.app_control.apps.basin.basin.hideKmlLayer();
		}
      basinList.empty();
      
      // Disable handlers:
      disableHandlers = true;
      
      // Create and display the marker:
      var marker = Streams.map.makeMarker(event.latLng, '');
      Streams.map.addMarker(marker);
      console.log(event.latLng);

      // Create the info window:
      var info   = Streams.map.makeInfoWindow();

      // Create and add a new basin object:
      var basin  = {        
        marker : marker,
        info   : info
      };      
     
      //// STATE MACHINE ////
      
      // This resets the prompt view to select another basin:
      function resetPrompt () {
       // disableHandlers = false;
        prompt.empty();
        rscript.empty();
        save_message.empty();
        basinList.empty();
        prompt_header.fadeIn();
      }
      

      // This function sends a message to the server to initiate a
      // KML download from streamstats.
      // DEPRECATED
      function request_kml () {
        // Grab the socket:
        var socket   = Streams.socket;
        var position = marker.getPosition();
        var getState = Streams.map.getState;

        getState(position,
                 function (state_name) {
                   var message  = {
                     state : state_name,
                     lat   : position.lat(),
                     lng   : position.lng() 
                   };                   
                   socket.emit('marker', message);
                 });
                 
        
      }

      // ### request_kml()
      // This function sends an HTTP request to the server to invoke the
      // basin delineation process:
      function delineateBasin() {
        var position = marker.getPosition();
        // TODO: At some point we should cache the lat/lng -> basin mapping so
        // we can avoid the post request.
        $.post('/basin/user/delineate', 
          { lat: position.lat(), 
            lng: position.lng() }, 
            function (basinData) {
              // // Get the basin if we already have it.
              var basin;
              if (basinTable[basinData.basinID]) {
                basin = basinTable[basinData.basinID];
              }
              else {
                // Create the new basin:
                var basin = new Basin({ id   : basinData.basinID,
                                        lat  : basinData.lat,
                                        lng  : basinData.lng,
                                        area : basinData.area
                                      });
              }

              // Hide the message:
              message.fadeOut('slow', function () { });

              // Close the info window:
              Streams.map.closeInfoWindow(info);
			  
			  
	    basin.hideKmlLayer();

              // Show the KML layer in the map:
              basin.showKmlLayer();

              // Add the basin to the basin table:
              basinTable[basin.id] = basin;

              // Remove marker:
              marker.setMap(null);

              // Verify basin:
              verify_basin(basin);
            });
      }

      // This function displays the initial loading messages
      // when a point on the map is clicked to select a basin.
      function retrieve_info () {
        var position = marker.getPosition();
        var lat      = position.lat().toPrecision(4);
        var lng      = position.lng().toPrecision(4);
		
		message.fadeIn('slow', function () { });
		
		$(message).empty();
		
        message.append('<center><h2 style="margin-top:100px;">Delineating Basin from Selection Point: </h2><h3> Latitude: ' + lat + ', <br>Longitude: ' + lng + "</h2>");
        message.append('<br><center><img style="margin-right:140px" src="images/ajax-loader.gif"/>');
        console.log("Looking for Position");
        $(basinList).css("display", "none");

        info.setContent('<div class="infowindow">Delineating Basin...</div>');
        Streams.map.openInfoWindow(info, marker);
        
        prompt_header.empty();
      }

      // This function is invoked when the KML data has been
      // loaded from the streamstats web service.
      function receive_kml (data) {
        message.fadeOut('slow', function () { });

        // Close the info window:
        Streams.map.closeInfoWindow(info);
        // Layer the KML object onto the map:
        var loc = 'http://' + document.location.host + '/' + data.kmlpath;
        var kml = Streams.map.loadKMLLayer(loc);
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
      	
        message.fadeOut('slow', function () { });
        Streams.map.closeInfoWindow(info);
        Streams.map.deleteMarker(marker);
        prompt.append('<p class="error">Error: ' + data.msg + '</p>');
        console.log(data.msg);
        //disableHandlers = false;
      }

      // This function prompts the user when the basin is overlayed onto
      // the google map. It asks the user if this is the basin they
      // are interested in.
      function verify_basin (basin) {
      	disableHandlers = false;
      
        var p1 = $('<center><p><h1>Use this point?</h1></p>' +
                   '<p>Enter basin name for My Saved Basins list.</p>'
                   );
                   
        //Save Basin Prompt           
        var sv = $('<br><center><h2>Basin Reference Name</h2>' + '<br />' + 
        		'<input type="text" id="refName" class="runInput" value=" Enter Name" onclick="this.value=\'\'"></input>' + '<br>' +
        		'<button id="savebtn" href="">Continue with this Basin</button><button id="cancelbtn" href="">Go Back</button>');
        		
        
        
        save_message.html(sv);

        prompt.html(p1);
        
        $(sv).find('input').bind("click");
        
        
        $(sv).find('#cancelbtn').button();
        $(sv).find('#cancelbtn').click(function (event){
        	event.preventDefault();
        	
        	save_message.empty();
         	prompt.empty();
        	startBasinDialog();
        	loadPredefinedBasins();
        	
        });
        
        $(sv).find('#savebtn').button();
        $(sv).find('#savebtn').click(function (event) {
          event.preventDefault();
         
          var saveName = $(sv).find('input').val();
          console.log(saveName);
          if(saveName == "Enter Name" || saveName == ""){
          	return;
          	this.alert("Please provide a basin name");
          }

          basin.setName(saveName);

          save_message.empty();
          prompt.empty();
          changeView(basin);
        });        
      }

      // This function prompts the user to select model to run and
      // displays the results in the prompt view.
      function select_model () {
       
        
        Streams.map.hide();
        

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
        //disableHandlers = false;
      }

      //// The Main Driver ////
      Streams.socket.on('kmldone', receive_kml);
      Streams.socket.on('kmlerror', kml_error);
      retrieve_info();
      //request_kml();
      delineateBasin();

      return false;
    }
	
	
	
    // Now register the events:
    Streams.map.addListener('rightclick', rightClickEvent);
  }
  
 
};
