Streams.app_control.apps.barriers = {
	name: "Barrier Models",
    basin:null,
	
	getRuns:function(){
		var runs = $.post('/users/script/runs', {'scriptname': "barrier", 'basin_id':Streams.app_control.apps.basin.basinId});
		var check = setInterval(function(){
			console.log(runs);
			if(runs.readyState == 4){
				clearInterval(check);
				var parse = Output.runInformation.parseResponse(runs.responseText);
				Streams.app_control.apps.barriers.populateRunList(parse);
				return runs;
			}
		}, 2000)
		return null;
	},
	
	populateRunList:function(rundata){
		$("#barriers-app .runTypeSelect .selectRun option[value!='Select a Completed Run']").each(function(){
			$(this).remove();
		})
		var selectorList = $("#barriers-app .runTypeSelect .selectRun");
		if(selectorList.length == 0){
			var option = $("<option disabled='true'>No Existing Runs Found</option>")
		}
		for(var i = 0;i < rundata.length;i++){
			var settings = "http://" + document.location.host + '/' + rundata[i];
			$.getJSON(settings, function(data){
				console.log(data);
				if(data.basin_id == Streams.app_control.apps.basin.basinId){
					var option = $("<option runId=" + data.runID + " stepId=" + data.stepID + " basin_id=" + data.basin_id +" >" + data.alias + "</option>")
					$(option).rundata = data;
					$(selectorList).append(option);
				}
				
			})
		}
		
		selectorList.change(function(){
			if($("#barriers-app .runTypeSelect .selectRun option:selected").html() == "Select a Completed Run"){
				//Streams.app_control.apps.weather_models.enableInputs();
				//Streams.app_control.apps.weather_models.exists = false;
				//Special for Weather. Regather all runs.
				//console.log("RESET")
				Streams.app_control.refreshAllApps();

			} else {
				Streams.app_control.apps.barriers.editSettings($("#barriers-app .runTypeSelect .selectRun option:selected"));
			}
		});
		
		
	},
	
	
	editSettings:function(data){
		var stepID = $(data).attr("stepID");
		console.log(stepID);
		
		var data = $.post('/database/barrier-settings', {'stepID':stepID});
		
		function checkData(){
			setTimeout(function(){
				if(data.readyState == 4){
					var resp = JSON.parse(data.responseText);
					populateDamInfo(resp);
				} else {
					checkData();
				}
			},100)
		}
		
		checkData();
		
		function populateDamInfo(dam_settings){
			console.log(dam_settings);
			
			var setting = dam_settings.step.settings.barrier_settings;
			console.log(setting);
			
			var bar_list = $("#barriers-app #barriers-container .bar_item");
	  		for(var i = 0;i<bar_list.length;i++){
	  			$(bar_list + " [data-id='" + setting[i].DAM_ID + "']" ).find("input").attr("checked", true);
	  		}
		}
		
		
		
	},
	
	getDams:function(){
		var basin = Streams.app_control.apps.barriers.basin;

		var url  = 'http://' + document.location.host + '/' + basin.id + '/dams.json';
		console.log(url);
		var damRequest = $.getJSON(url, function(data){
			console.log(data);
			Streams.app_control.apps.barriers.populateDams(data);
		})

	},
	
	init:function(){
		console.log("INITIALIZING THE BARRIER SCRIPTS");
		 var view             = $('#barriers-app');
 		 var runButton        = view.find('#run');
		 var select		 = view.find(".selectRun");
   		 var createnew	 = view.find('.createnew');
 		createnew.button();
  		   $(createnew).bind('click', function(){
			//Streams.app_control.apps.weather_models.enableInputs();
				Streams.app_control.refreshAllApps();
			})
		 runButton.button();
		 runButton.on('click', function(){
		 	Streams.app_control.apps.barriers.run();
		 });



	},
	
	
	populateDams:function(data){
		//Window
		var application = $("#barriers-app #barriers-container");
		
		//List
		var list = $("<ul id='barrier-list' style=''></ul>");
		$(list).empty();
		for(var i = 0;i < data.length;i++){
			var item = data[i];
			var li = $("<li id='bar" + i + "' class='bar_item' clip='ignore' data-id='" + item.UNIQUE_ID +  "' style='width='300px'>" + item.DAM_NAME + "<br /> " + item.description + "<input type='checkbox' style='opacity:1;margin-left: 36px;margin-top: -14px;position:static;float:right;'></li>")
			var input = $(li).find("input");
			$(input).on('click', function(){
				if($(this).attr('checked')){
					$(this).parent().attr("clip", "clip_catchment")
				} else {
					$(this).parent().attr("clip", "ignore")
				}
			})
			
			$(list).append(li);
		}
		
		$(application).append(list);
		console.log("Displayed Barriers")
		
		var inputs = $("#barriers-app #barriers-container .bar_item input");
		console.log(inputs);
		
	},
	
	run:function(){
		var basin_id = Streams.app_control.apps.basin.basin.id;
  		var run_alias = $('div#barriers-app.application .runModel .runInput').val();
	  	if(run_alias == "" || run_alias == "Select a Completed Run" || run_alias == undefined || run_alias == " Enter a run name"){
	  		run_alias = Streams.app_control.generateRandomName("barrier", "clip");
	  	}
	  	
	  	var barrier_settings = [];
		var bar_list = $("#barriers-app #barriers-container .bar_item");
	  	for(var i = 0;i<bar_list.length;i++){
	  		var obj = {};
	  		obj.damID = $(bar_list[i]).attr("data-id");
	  		obj.clip = $(bar_list[i]).attr("clip");
	  		barrier_settings.push(obj);
	  	}
	  	
	  	//barrier_settings = JSON.stringify(barrier_settings);
	  	console.log(barrier_settings)
	  	
	  	var barrier = {
	  		step:"barrier",
	  		run_alias:run_alias,
	  		basin_id:basin_id,
	  		barrier_settings:barrier_settings
	  	}
	  	
	  	console.log(barrier)
	  	
	  	var serverResponse = $.post('/execute-step', {
	  		"webInfo": {
	  			"barrier": {
	  				"step":"barrier",
	  				"flag":"true",
	  				"alias":barrier.run_alias,
	  				"scriptName":"clip_basin_by_barrier",
	  				"basin_id":barrier.basin_id,
	  				"barrier_settings":barrier.barrier_settings
	  			}
	  		}
	  	})
	  	Status.addQueue(barrier);
	  	
	  	var checkRespo = setTimeout(function(){
			if(serverResponse.readyState == 4){
				console.log(serverResponse)
				clearInterval(checkRespo);
				var output = Output.runInformation.parseResponse(serverResponse.responseText);
				console.log(output)
				
				var runStatus = $.post('/mexec/status', {"runID":output.stepID}).done(function(data) { 
					console.log(data) 
					console.log(runStatus);
					
				    runStatus.runID = output.stepID;
					runStatus.alias = output.alias;
					runStatus.canExec = true;
					Status.runningProcesses.push(runStatus);
					var selectorList = $("#barriers-app .runTypeSelect .selectRun");
					var option = $("<option selected runId=" + output.runID + " stepId=" + output.stepID + " basin_id=" + barrier.basin_id + " scriptName=" + barrier.scriptName + ">" + barrier.run_alias + "</option>")
					$(option).rundata = barrier;
					$(selectorList).append(option);
					Streams.app_control.apps.barriers.existingStepId = output.stepID;

					});
				
				
			}
		},1000)
  		//DISABLE INPUTS
  	//Streams.app_control.apps.land_use_models.disableInputs();
  	

	},
	
	getBarrierInformation:function(){
		var basin_id = Streams.app_control.apps.basin.basin.id;
  		var run_alias = $('div#barriers-app.application .runModel .runInput').val();
	  	if(run_alias == "" || run_alias == "Select a Completed Run" || run_alias == undefined || run_alias == " Enter a run name"){
	  		run_alias = Streams.app_control.generateRandomName("barrier", "clip");
	  	}
	  	
	  	var barrier_settings = [];
		var bar_list = $("#barriers-app #barriers-container .bar_item");
	  	for(var i = 0;i<bar_list.length;i++){
	  		var obj = {};
	  		obj.damID = $(bar_list[i]).attr("data-id");
	  		obj.clip = $(bar_list[i]).attr("clip");
	  		barrier_settings.push(obj);
	  	}
	  	
	  	barrier_settings = JSON.stringify(barrier_settings);
	  	console.log(barrier_settings)
	  	
	  	var barrier = {
	  		step:"barrier",
	  		run_alias:run_alias,
	  		basin_id:basin_id,
	  		barrier_settings:barrier_settings
	  	}
	  	
	  	return barrier;
	}
	
	
}
