var streamtemp = Step.extend({
	name:'streamtemp',
	dom:'#streamtemp-flow-app',
	preceded:['barrier','climate','land','flow'],

	populateInput:function(options, isDOM){
		var data = this._super(options, isDOM);
		var that = this;
		var storedData = data;
		
		//TODO: EDIT SETTINGS


		if(isDOM == true){
			this.setParents(data.stepID, data);
			this.setDependents(data.stepID);


		}

	},

	createAndRefresh:function(){
		this._super();
		Streams.app_control.apps.population.getRuns();
		clearThumbnailsFromChild(5);
	},


	execute:function(){
		
		this._super();
		
		/*
		var streamtemp_model = this.getInfo();
		var flow_model = Streams.app_control.apps.flow.getInfo();
		var land_model = Streams.app_control.apps.land.getInfo();
		var barrier_model = Streams.app_control.apps.barrier.getInfo();
		var climate_model = Streams.app_control.apps.climate.getInfo();
		console.log(flow_model);

		Status.addQueue(flow_model);


		var serverResponse = $.post('/execute-step', {
			"webInfo":{
				"barrier":barrier_model,
				"climate":climate_model,
				"land":land_model,
				"flow":flow_model,
				"streamtemp":streamtemp_model
			}
		});

		
		this.startCheck(serverResponse);
		*/


	},

	getInfo:function(){
		var vars = this._super();

		var streamtemp_model = {
			step:"streamtemp",
			alias:vars.run_alias,
			scriptName:vars.scriptName,
			basin_id:vars.basin_id,
			existing_step_id:vars.stepID,
			skipped:vars.skipped,
		}

		return streamtemp_model;
	}


});