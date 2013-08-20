var population = Step.extend({
	name:'population',
	dom:'#fish-models-app',
	preceded:['barrier','climate','land','flow','streamtemp'],

	start:function(){
		this._super();
		var view = $(this.dom);
		var stockingslider1 = view.find('.stockingslider1');
    		var stockingNumber = view.find('.stockingNumber');
    		var countslider1 = view.find('.countslider1');
   		 var countNumber = view.find('.countNumber');

		countslider1.slider({
      		max    : 100,
	        min     : 0,
	        range   : 'min',
	        value   : 50,
	        animate : 'fast',
     		 disabled:false,
     		 slide   : function (event, ui) {
     		 	countNumber.text(ui.value);
     		 }
    });


		
	},

	populateInput:function(options, isDOM){
		var data = this._super(options, isDOM);
		var that = this;
		var storedData = data;
		
		//TODO: EDIT SETTINGS
		//stocking_count: "18"
		//stocking_stage: "Fry"
		var view = $(this.dom);
    		var countslider1 = view.find('.countslider1').slider("value", data.stocking_count);
   		var countNumber = view.find('.countNumber').html(data.stocking_count);


		if(isDOM == true){
			this.setParents(data.stepID, data);
			this.setDependents(data.stepID);


		}

	},

	createAndRefresh:function(){
		this._super();
		clearThumbnailsFromChild(6);
	},

	execute:function(){
		this._super();
		
		/*
		var population_model = this.getInfo();
		var streamtemp_model = Streams.app_control.apps.streamtemp.getInfo();
		var flow_model = Streams.app_control.apps.flow.getInfo();
		var land_model = Streams.app_control.apps.land.getInfo();
		var barrier_model = Streams.app_control.apps.barrier.getInfo();
		var climate_model = Streams.app_control.apps.climate.getInfo();
		console.log(population_model);		
		

		
		Status.addQueue(flow_model);
		var serverResponse = $.post('/execute-step', {
			"webInfo":{
				"barrier":barrier_model,
				"climate":climate_model,
				"land":land_model,
				"flow":flow_model,
				"streamtemp":streamtemp_model,
				"population":population_model
			}
		});

		
		this.startCheck(serverResponse);
		*/
		

	},

	getInfo:function(){
		var vars = this._super();
		var stocking_stage = $("#" + vars.scriptName + " select.selectStockingStage" ).val();
		var stocking_count = $("#" + vars.scriptName + " .countNumber" ).html();	//Get Basin ID and ALIAS
  	
		var population_model = {
			step:"population",
			alias:vars.run_alias,
			stocking_stage:stocking_stage,
			stocking_count:stocking_count,
			scriptName:vars.scriptName,
			basin_id:vars.basin_id,
			skipped:vars.skipped,
			existing_step_id:vars.stepID,
		}

		return population_model;
	}


});