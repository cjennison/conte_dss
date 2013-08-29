var streamtemp = Step.extend({
	name:'streamtemp',
	dom:'#streamtemp-flow-app',
	position:5,
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
		
		
	},

	getInfo:function(source){
		var vars = this._super(source);
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