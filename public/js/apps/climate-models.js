var climate = Step.extend({
	name:'climate', 
	dom:'#weather-models-app',
	position:2,
	preceded:['barrier'],
	skipped:false,
	state:"NO MODEL",
	
	start:function(){
		this._super();
		console.log("IS MINE");
		
		var view = $(this.dom);
		//All input initiation goes here [script][type][num][typeofinput]
		var precipSlider1Val = view.find("#precip01-value");
		var precipSlider2Val	= view.find("#precip02-value");
		var graph1		= view.find("#graphcontainer1");
		var graph2		= view.find("#graphcontainer2");
		var meanTempChange	= view.find("#mean-temp");
		var meanTempChangeVal= view.find("#mean-temp-value");
		
		//Values for Sliders
		 precipSlider1Val.text(1);
  	 	 precipSlider2Val.text(1);
   		 meanTempChangeVal.text(0);
	
		//Input Graphs
	
		
		//this.setNewRun();
		

	},

	configureInputs:function(){
		inputGraph.initGraph("WeatherModel_Precipitation", "#graphcontainer1", "graphcontainer1", this.config[1].input["precip_graph"].variation, this.config[1].input["precip_graph"].html, this.config[1].input["precip_graph"].min, this.config[1].input["precip_graph"].max, this.config[1].input["precip_graph"].xAxis, this.config[1].input["precip_graph"].yAxis);
		inputGraph.initGraph("WeatherModel_Temperature" , "#graphcontainer2", "graphcontainer2", this.config[1].input["temp_graph"].variation, this.config[1].input["temp_graph"].html, this.config[1].input["temp_graph"].min, this.config[1].input["temp_graph"].max, this.config[1].input["temp_graph"].xAxis, this.config[1].input["temp_graph"].yAxis);

		inputGraph.initGraph("Baseline_Precipitation", "#baselineHistoric_graphcontainer1", "baselineHistoric_graphcontainer1", this.config[2].input["precip_graph"].variation, this.config[2].input["precip_graph"].html, this.config[2].input["precip_graph"].min, this.config[2].input["precip_graph"].max, this.config[2].input["precip_graph"].xAxis, this.config[2].input["precip_graph"].yAxis);
		inputGraph.initGraph("Baseline_Temperature" , "#baselineHistoric_graphcontainer2", "baselineHistoric_graphcontainer2", this.config[2].input["temp_graph"].variation, this.config[2].input["temp_graph"].html, this.config[2].input["temp_graph"].min, this.config[2].input["temp_graph"].max, this.config[2].input["temp_graph"].xAxis, this.config[2].input["temp_graph"].yAxis);
	
	},


	
	populateInput: function(options, isDOM){
		var data = this._super(options, isDOM);
		var that = this;
		inputGraph.populateInputs(data);
		var storedData = data;
	  	
	  	$('#' + data.scriptname + ' ' + '#mean_1').val(data.precip_mean_y1);
	  	
	  	$('#' + data.scriptname + ' ' + '#mean_2').val(data.precip_mean_yn);
	  	$('#' + data.scriptname + ' ' + '#precip02-value').val(data.precip_var_y1);
	  	$('#' + data.scriptname + ' ' + '#mean_temp_1').val(data.temp_mean_y1);
	  	$('#' + data.scriptname + ' ' + '#mean_temp_2').val(data.temp_mean_yn);

		if(isDOM == true){
			this.setParents(data.stepID, data);
			this.setDependents(data.stepID);
		}

	},

	createAndRefresh:function(){
		this._super();
		Streams.app_control.apps.land.getRuns();	
		Streams.app_control.apps.flow.getRuns();	
		Streams.app_control.apps.streamtemp.getRuns();
		Streams.app_control.apps.population.getRuns();
		clearThumbnailsFromChild(2);
	},



	

	disableInputs:function(){
		this._super();
		inputGraph.disableInputs();
	},

	enableInputs:function(){
		this._super();
		inputGraph.enableInputs();
	},

	execute:function(){
		this._super();
		/*
		var climate_model = this.getInfo()


		var barrier_model = Streams.app_control.apps.barrier.getInfo();
		Status.addQueue(climate_model);
		
		var serverResponse = $.post('/execute-step', {
			"webInfo":{
				"barrier":barrier_model,
				"climate":climate_model
			}
		});

		this.startCheck(serverResponse);
		*/

	},
	

	getInfo:function(source){
		var vars = this._super(source);

		var curGraph = 0;
		var model = $('div#weather-models-app.application .styledSelect select');
  	
  		//Passed Variables
  		var scriptName = $(model).val();
  		if(scriptName == "weather_generator"){
  			curGraph = 0;
  		} else if(scriptName == "baseline_shift"){
  			curGraph = 2;
  		}
  		
		var scenario = $('div#weather-models-app.application div.app_content #emissions_scenario.styledSelect_ select option:selected').val();
		var projection = $('div#weather-models-app.application div.app_content #proj_drop.styledSelect_ select option:selected').val();
		
console.log(scenario );
  	
  		console.log(scriptName);
  		var precip_mean_y1 = graphObject[curGraph].startMeanVal;
		if(precip_mean_y1 == undefined){precip_mean_y1 = 0};
  	
  		var precip_mean_yn = graphObject[curGraph].endMeanVal;
		if(precip_mean_yn == undefined){precip_mean_yn = 0};

  		var precip_var_y1 = graphObject[curGraph].startVarVal;
		if(precip_var_y1 == undefined){precip_var_y1 = 0};

  		var precip_var_yn = graphObject[curGraph].endVarVal;
		if(precip_var_yn == undefined){precip_var_yn = 0};

  		var temp_mean_y1 = graphObject[curGraph+1].startMeanVal;
		if(temp_mean_y1 == undefined){temp_mean_y1 = 0};

  		var temp_mean_yn = graphObject[curGraph+1].endMeanVal;
		if(temp_mean_yn == undefined){temp_mean_yn = 0};
  		var n_years = Streams.yearRange || 30;

		var climate_model =  {
			step:"climate",
			alias:vars.run_alias,
			scriptName:vars.scriptName,
			basin_id:vars.basin_id,
			existing_step_id:vars.stepID,
			scenario:scenario,
			projection:projection,
			precip_mean_y1:precip_mean_y1,
  					precip_mean_yn:precip_mean_yn,
  					precip_var_y1:precip_var_y1,
  					precip_var_yn:precip_var_yn,
  					temp_mean_y1:temp_mean_y1,
  					temp_mean_yn:temp_mean_yn,
  					n_years:n_years,
					skipped:vars.skipped,

		}

		return climate_model;

	}


});




