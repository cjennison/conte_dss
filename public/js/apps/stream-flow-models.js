var flow = Step.extend({
	name:'flow',
	dom:'#environmental-models-app',
	position:4,
	preceded:['barrier','climate','land'],

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
		Streams.app_control.apps.streamtemp.getRuns();	
		Streams.app_control.apps.population.getRuns();
		clearThumbnailsFromChild(4);
	},

	execute:function(){
		this._super();
		/*
		var flow_model = this.getInfo();
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
				"flow":flow_model
			}
		});

		
		this.startCheck(serverResponse);
		*/



	},

	getInfo:function(source){
		var vars = this._super(source);

		var flow_model = {
			step:"flow",
			alias:vars.run_alias,
			scriptName:vars.scriptName,
			basin_id:vars.basin_id,
			existing_step_id:vars.stepID,
			skipped:vars.skipped,
		}

		return flow_model;
	}



});