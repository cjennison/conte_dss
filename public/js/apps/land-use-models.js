var land = Step.extend({
	name:'land',
	dom:'#land-use-models-app',
	pctForest:50,
	position:3,
	preceded:['climate', 'barrier'],
	managed:true,

	start:function(){
		this._super();
		var view=$(this.dom);
		var model = $('div#land-use-models-app.application .styledSelect select.selectRun');
		var emissions = $('div#land-use-models-app.application div.app_content #emissions.styledSelect select');
    
   		var riparianslider1 = view.find('.riparianslider1');
    		var surfaceslider1 = view.find('.surfaceslider1');
    
   		var riparianNumber = view.find('.riparianNumber');
    		var surfaceNumber = view.find('.surfaceNumber');
		riparianslider1.slider({
     			max    : 100,
		       min     : 0,
	       	range   : 'min',
	      		value   : 50,
	     	   	animate : 'fast',
      			disabled:false,
      			slide   : function (event, ui) {
      				riparianNumber.text(ui.value);
      			}
   		 });
    
   		 surfaceslider1.slider({
     			 max    : 100,
	      	 	 min     : 0,
	       	 range   : 'min',
	       	 value   : 50,
	       	 animate : 'fast',
     			 disabled:false,
     			 slide   : function (event, ui) {
     			 	surfaceNumber.text(ui.value);
     			 }
   		 });
		
		emissions.change(function(){
    			console.log($(this).val())
    		});


		
	},

	configureInputs:function(){
		this._super();
		var view=$(this.dom);

		var pctCounter = view.find('.pctForest');
   		 var pctSlider = view.find('.forestSlider');
		console.log("LAND CONF");
		console.log(this.config);
    		pctSlider.slider({
     		    max    : this.config[1].input["pctForest"].max,
	    	    min     : this.config[1].input["pctForest"].min,
	    	    range   : 'min',
	    	    value   : this.config[1].input["pctForest"].init,
	    	    animate : 'fast',
     		    disabled:false,
     			 slide   : function (event, ui) {
     			 	pctCounter.text(ui.value);
     			 	Streams.app_control.apps.land.pctForest = ui.value;
     			 }
    		});
		this.disableInputs();
		
	},



	populateInput:function(options, isDOM){
		var data = this._super(options, isDOM);
		var that = this;
		var storedData = data;
		
		//TODO: EDIT SETTINGS
		console.log(data);
		//percent_change_forest: "73"
		
		var view=$(this.dom);

		//Pct Forest
		var pctCounter = view.find('.pctForest');
   		var pctSlider = view.find('.forestSlider');
    		$(pctCounter).html(data.percent_change_forest);
		this.pctForest = data.percent_change_forest;
		$( pctSlider ).slider( "value", data.percent_change_forest);

		if(isDOM == true){
			this.setParents(data.stepID, data);
			this.setDependents(data.stepID);


		}


	},

	createAndRefresh:function(){
		this._super();
		Streams.app_control.apps.flow.getRuns();	
		Streams.app_control.apps.streamtemp.getRuns();	
		Streams.app_control.apps.population.getRuns();
		clearThumbnailsFromChild(3);
	},

	
	execute:function(){
		this._super();

		/*
		var land_model = this.getInfo();
		var barrier_model = Streams.app_control.apps.barrier.getInfo();
		var climate_model = Streams.app_control.apps.climate.getInfo();
		console.log(land_model);

		Status.addQueue(land_model);


		var serverResponse = $.post('/execute-step', {
			"webInfo":{
				"barrier":barrier_model,
				"climate":climate_model,
				"land":land_model
			}
		});

		
		this.startCheck(serverResponse);
		*/


	},

	getInfo:function(source){
		var vars = this._super(source);

		var pctForest = this.pctForest;
		var emissions = $('div#land-use-models-app.application div.app_content #emissions.styledSelect select');

		var land_model = {
			step:"land",
			alias:vars.run_alias,
			scriptName:vars.scriptName,
			basin_id:vars.basin_id,
			existing_step_id:vars.stepID,
			percent_change_forest:pctForest,
			scenario:$(emissions).val(),
			skipped:vars.skipped,
		}

		return land_model;
	}


})	