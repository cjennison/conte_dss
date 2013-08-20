/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();




var Step = Class.extend({

	name: null, //'climate'
	dom: null, //#weather-models-app
	step_id: null,
	preceded:[],
	config:null,
	skipped:false,
	type:null,
	
	getRuns: function(){
		var that = this;
		console.log(this);
		

		var runs = $.post('/users/script/runs', {'scriptname': this.name, 'basin_id':Streams.app_control.apps.basin.basinId});
		console.log(runs);
		var check = setInterval(function(){
			console.log("[STEP]");

			if(runs.readyState == 4){
				clearInterval(check);
				//console.log(run);
				var data = Output.runInformation.parseResponse(runs.responseText);
				
				that.populateRunList(data);
			}
		}, 100);
	},

	populateRunList: function(rundata){
		this.enableInputs();
		var that = this;
		//console.log($(this.dom + " .runTypeSelect .selectRun option"));
		$(this.dom + " .runTypeSelect .selectRun option").each(function(){
			$(this).remove()
		});
		var selectorList = $(this.dom + " .runTypeSelect .selectRun");
		var option = $("<option>Select a Completed Run</option>");
		selectorList.append($("<option>Select a Completed Run</option>"));
		selectorList.append($("<option>Skip this Step</option>"));



		
		
		Streams.app_control.removeLoader();

		var selectorList = $(this.dom + " .runTypeSelect .selectRun");
		for(var i = 0;i < rundata.length;i++){
			var settings = "http://" + document.location.host + '/' + rundata[i];
			$.getJSON(settings, function(data){
				//console.log(data);
				if(data.basin_id == Streams.app_control.apps.basin.basinId){
					var option = $("<option runId=" + data.runID + " stepId=" + data.stepID + " basin_id=" + data.basin_id +" n_years=" + data.n_years + " scriptName=" + data.scriptName + " precip_mean_y1=" + data.precip_mean_y1 + " precip_mean_yn=" + data.precip_mean_yn + " precip_var_y1=" + data.precip_var_y1 +" precip_var_yn=" + data.precip_var_yn + " temp_mean_y1=" + data.temp_mean_y1 + " temp_mean_yn=" + data.temp_mean_yn + ">" + data.alias + "</option>")
					$(option).rundata = data;
					$(selectorList).append(option);
				}
				
			})
		}
		
		//Step Idler
		setTimeout(function(){
			var selectorOptions = $(that.dom + " .runTypeSelect .selectRun option");
			if(selectorOptions.length == 1){
				var option = $("<option disabled='true'>No Existing Runs Found</option>")
				$(selectorList).append(option);
			}
		},5000);
		
		
		selectorList.change(function(){
			console.log("U WOT");
			if($(that.dom + " .runTypeSelect .selectRun option:selected").html() == "Select a Completed Run"){
				that.createAndRefresh();
			} else if($(that.dom + " .runTypeSelect .selectRun option:selected").html() == "Skip this Step"){
				that.skipStep();				

			} else {
				that.editSettings($(that.dom + " .runTypeSelect .selectRun option:selected"), true);
			}
		})

		
	},

	skipStep:function(){
		this.disableInputs();
		this.skipped = true;
		
		for(var name in Streams.app_control.apps){
			if(name != 'basin'){
				Streams.app_control.apps[name].evaluateAvailableModels();
			}
			
		}

	},

	evaluateAvailableModels:function(){
		//console.log("EVAL");
		//this.enableInputs();
		$("select option[val!='No Existing Runs Found']").prop("disabled", false);
		for(var i = 0;i<this.config.length;i++){
			var script = this.config[i].script,
			      reqs = this.config[i].requirements;
			
			for(var j = 0;j < reqs.length;j++){
				var script_set = reqs[j].script; //An array of accepted script classes
				if(script_set.indexOf(null) > -1){
					console.log(script + " does not require scripts from " + reqs[j].step);
				}
				
				else {
					console.log(script_set);
					if(script_set.indexOf(Streams.app_control.apps[reqs[j].step].type) < 0 || Streams.app_control.apps[reqs[j].step].skipped == true){
						console.log(script + " cannot run because " + Streams.app_control.apps[reqs[j].step].step + " has an incompatible type");
						$("select option").filter(function() {
   							 return $(this).val() == script; 
							}).prop('disabled', true);	
					}				
				}
				
				
				//console.log(reqs[j].step);
				/* Old FORCED Trick
				if(reqs[j].forced == true){
					if(Streams.app_control.apps[reqs[j].step].skipped == true){
						$("select option").filter(function() {
   							 return $(this).val() == script; 
							}).prop('disabled', true);					
					}
				}
				*/
				
			}
			
		}
		var opts = $(this.dom + " .styledSelect .selectRun option");
		var num_disabled = 0;
		for(var mod = 0; mod < opts.length; mod++){
			//console.log($(opts[mod]).prop('disabled'));
			if($(opts[mod]).prop('disabled') == true){
				num_disabled++;
			}
		}
		console.log(num_disabled + " : " + opts.length); 
		if(num_disabled == opts.length && num_disabled > 0){
			console.log("DISABLING");
			this.disableInputs();
						
		} else {
			
		}
		
		console.log("THERE ARE THIS MANY DISABLED: " + num_disabled + " " + this.dom);
	},

	editSettings: function(options, isDOM){
		var data;
		var pre_thumblist = [];
		var that = this;
		this.skipped = false;

		for(var name in Streams.app_control.apps){
			if(name != 'basin'){
				Streams.app_control.apps[name].evaluateAvailableModels();
			}
			
		}


		if(isDOM == true){
			data = $(options).getAttributes();	
			pre_thumblist.push({
				url:Streams.user + "/" + this.name + "/" + data.stepid + "/"
			});
			Graphing.plotGraphs(data.stepid);
			this.step_id = data.stepid;
		} else {
			console.log("[STEP] I AM SETTING THE SELECTOR NOW");
			data = options;
			this.step_id = data.stepID;
			var selectorList = $(this.dom + " .runTypeSelect .selectRun");
			$(selectorList).val(data.alias);
		}

		that = this;

		//AJAX REQUEST
		var step_data = $.post('/output/getStepInfo', {'stepID':that.step_id});
		function getStep(){
			setTimeout(function(){
				if(step_data.readyState == 4){
					step_data = JSON.parse(step_data.responseText);
					console.log(step_data);
					step_data = step_data.data[0].settings;
					that.populateInput(step_data, isDOM);
					for(var name in Streams.app_control.apps){
						if(name != 'basin' && name != that.name && that.preceded.indexOf(name) == -1){
							Streams.app_control.apps[name].evaluateAvailableModels();
					

						}
			
					}

				} else {
					getStep()
				}
			}, 100);
		}

		getStep();
		
		

		
	},

	setDependents:function(stepID){
		var that = this;
		var dependantRunSetter = $.post('/get-run-children', {stepId:stepID, step:this.name}).done(function(){
	  		console.log(dependantRunSetter);
		  	var data = JSON.parse(dependantRunSetter.responseText);
			for(var name in data){
				
				
				if(name != that.name && that.preceded.indexOf(name) == -1){
					console.log(data[name]);
					console.log(that.preceded.indexOf(name));
					console.log(name);
					Streams.app_control.apps[name].populateRunList(data[name]);
				}
				
			}

		 })
		var pre_thumblist = [];
		pre_thumblist.push({url:Streams.user+ "/" + this.name + "/" + stepID + "/"})
		//this.buildThumbnailList(pre_thumblist);

	},

	setParents:function(stepID, step){
		var that = this;
		console.log("SETTING THE PARENTS OF:    __________________")
		console.log(step);
		var previousRunSetter = $.post('/get-run-parents', {stepId: stepID, step:this.name}).done(function(){
		  		var data = JSON.parse(previousRunSetter.responseText);
		  		//Streams.app_control.apps.barrier.editSettings(data.message[0], false);
		  		
				var pre_thumblist = [];
				pre_thumblist.push({
					url:Streams.user+ "/" + that.name + "/" + stepID + "/",
					skipped:step.skipped
				})
				console.log("MESSAGE SET: ---------------------------- ")
				console.log(data.message);
				for(var i = 0;i < data.message.length;i++){
					var item = data.message[i];
					Streams.app_control.apps[item.step].editSettings(data.message[i], false);
					pre_thumblist.push({
						url:item.user + "/" + item.step + "/" + item.stepID + "/",
						skipped:data.message[i].skipped
					})
				}
				
				that.buildThumbnailList(pre_thumblist);
	  		
	  		})
	},

	populateInput:function(data, isDOM){
		console.log(data);
		var model = $(this.dom + ' .styledSelect select');
		$(model).val(data.scriptName);
		var appContent = $(this.dom + ' .app_content .app');
		for(var i=0;i<appContent.length;i++){
			if($(appContent[i]).hasClass("active")){
				$(appContent[i]).removeClass("active")
			}
		}
		
		$(this.dom + ' ' + '#' + $(model).val()).addClass("active")
		
		if(data.skipped == "true"){
			var selectorList = $(this.dom + " .runTypeSelect .selectRun");
			$(selectorList).val("Skip this Step");

		}

		this.disableInputs();
		
		return data;
	},

	disableInputs:function(){
		var model 	= $(this.dom + " .styledSelect select");
		var view 	= $(this.dom);
		var runButton = view.find('#run');
			runButton.button('option', 'disabled', true);
	
		var inputs = $(this.dom + ' input');
		for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', true);
	  	}
	  	
	  	$(model).prop("disabled", true)
		var runInputs = $(this.dom + " .runModel");
			$(runInputs).css('display', 'none');
	},

	enableInputs:function(){
		//console.log(this);
		var model	= $(this.dom + " .styledSelect select");
		var view	= $(this.dom);
		var runButton	= view.find("#run");
			runButton.button('option', 'disabled', false);

		var inputs	= $(this.dom + " input");
		for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', false);
	  	}
	  	
	  	$(model).prop("disabled", false)
		var runInputs = $(this.dom + " .runModel");
			$(runInputs).css('display','block');
		
		var selectorList = $(this.dom + " .runTypeSelect .selectRun");
			$(selectorList).val("Select a Completed Run");

		this.step_id = null;

	},

	start: function(){
		var that = this;		

		//Add application class
		var view = $(this.dom);
		$(view).addClass("application");

		//General Inputs
		var runButton = view.find('#run');
			runButton.button();
			runButton.click(function(event){
				that.execute();
			})
		var select	= view.find('.selectRun');
		var createNew	= view.find('.createnew');
			createNew.button();
			$(createNew).bind('click', function(){
				that.createAndRefresh();
			});
			
		//Model
		var model = $(this.dom + ' .styledSelect select');
		model.change(function(){
			var appContent = $(that.dom + ' .app_content .app');
			for(var i=0;i<appContent.length;i++){
				if($(appContent[i]).hasClass("active")){
					$(appContent[i]).removeClass("active")
				}
			}
			$(that.dom + ' ' + '#' + $(this).val()).addClass("active")
			
			if(that.config){
				for(var j = 0;j < that.config.length;j++){
					if(that.config[j].script == $(this).val()){
						console.log(that.config[j].class);
						that.type = that.config[j].class;
						console.log(that.type);
						
					}
				} 
			}

			for(var name in Streams.app_control.apps){
				if(name != 'basin' && name != that.name && that.preceded.indexOf(name) == -1){
					Streams.app_control.apps[name].enableInputs();
					Streams.app_control.apps[name].evaluateAvailableModels();
					

				}
			
			}


		})

				
		this.configureModels();
	},

	configureModels:function(){
		var that = this;
		console.log("CONFIGURING MODELS");
		var settings = "http://" + document.location.host + '/config/models.json';
		$.getJSON(settings, function(data){
			var config = data[that.name];
			that.config = config;
			//console.log(config);
			if(config == undefined){return};
			
			var models = $(that.dom + ' .styledSelect .selectRun option');
			
			
			

			for(var i=0;i<config.length;i++){
				console.log($(that.dom + ' .styledSelect select option[value=' + config[i].script + ']'));
				$(that.dom + ' .styledSelect .selectRun').append("<option value='" + config[i].script + "'>" + config[i].alias + "</option");
				$(that.dom + ' .styledSelect .selectRun option[value=' + config[i].script + ']').prop("disabled", config[i].disabled);;
			}

			that.type = that.config[0].class;
			console.log(this);
		})

	},

	createAndRefresh:function(){
		this.enableInputs();
		this.skipped = false;
		for(var name in Streams.app_control.apps){
			if(name != 'basin'){
				Streams.app_control.apps[name].evaluateAvailableModels();
			}
			
		}

		console.log("This function will not refresh child runs unless it has been extended to do so.");
	},

	execute:function(){
		var this_model = this.getInfo();
		console.log(this_model);
		
		var webInfo = []

		console.log("SELF REQUIREMENT TESTING");
		var requirements;
		console.log(this);
		if(this.config != null){
			for(var sc = 0; sc < this.config.length; sc++){
				console.log(this.config[sc].script)
				console.log(this_model.scriptName);
				console.log("_______________");
				if(this.config[sc].script == this_model.scriptName){
					console.log("MATCH");
					requirements = this.config[sc].requirements;
				}
			}

			if(requirements.length > 0){
				for(var req = 0;req < requirements.length;req++){
					webInfo.push(Streams.app_control.apps[requirements[req].step].getInfo());
					console.log(Streams.app_control.apps[requirements[req].step].getInfo());
				}
			}
	
			
		
		}
		

		webInfo.push(this_model);
		Status.addQueue(this_model);

		
		var serverResponse = $.post('/execute-step', {
			"webInfo":webInfo
		});

		
		this.startCheck(serverResponse);
		
		
		
		console.log(webInfo);
		
	},

	buildThumbnailList:function(list){
		var dropdown_url = list[0];
		list.splice(0, 1);
		//list.reverse();
		list.push(dropdown_url);
		Streams.app_control.addThumbnail(list);
	},

	startCheck:function(serverResponse){
		var that = this;
		
		function checkResponse(){
		setTimeout(function(){
			if(serverResponse.readyState == 4){
				var output = Output.runInformation.parseResponse(serverResponse.responseText);
				console.log(output);
				var runStatus = $.post('/mexec/status', {"runID":output.stepID}).done(function(data) { 
					console.log(data) 
					var stored_data = JSON.parse(data);
					console.log(stored_data);
										
				    runStatus.runID = output.stepID;
					runStatus.alias = output.alias;
					runStatus.canExec = true;
					Status.runningProcesses.push(runStatus);
					//that.addToList(output);
					

					var run_set = stored_data.run;
					for(var i = 0;i<run_set.length;i++){
						console.log(Streams.app_control.apps[run_set[i].step]);
						if(Streams.app_control.apps[run_set[i].step].step_id == null){
							//that.step_id  = output.stepID;
							Streams.app_control.apps[run_set[i].step].step_id = run_set[i].stepID;
							Streams.app_control.apps[run_set[i].step].addToList(run_set[i]);
						}
						
					}

					$(this.dom + " .runTypeSelect .selectRun option[value='No Existing Runs Found']").each(function(){
						$(this).remove()
					});


				});

				
				
			} else {
				checkResponse()
			}
		},1000)
		}
		checkResponse()
		
	},
	
	addToList:function(output){
	
		var selectorList = $(this.dom + " .runTypeSelect .selectRun");
		//console.log(selectorList);
		var option = $("<option selected stepId=" + output.stepID + " basin_id=" + output.basin_id + " scriptName=" + output.scriptName + ">" + output.alias + "</option>")
		$(selectorList).append(option);
	},


	getInfo:function(){
		console.log("Extend Running");
		var basic_settings = {};
			basic_settings.basin_id = Streams.app_control.apps.basin.basin.id;
			basic_settings.run_alias = $(this.dom + " .runModel .runInput").val();
			basic_settings.scriptName = $(this.dom + " .styledSelect select").val();
			basic_settings.stepID = this.step_id;
			basic_settings.skipped = this.skipped;
		
		if(basic_settings.scriptName == undefined){basic_settings.scriptName == "_"}		
		
		//Autogenerate name and add to list
		if(basic_settings.run_alias == "" || basic_settings.run_alias == "Select a Completed Run" || basic_settings.run_alias == undefined || basic_settings.run_alias == " Enter a run name"){
	  		basic_settings.run_alias = Streams.app_control.generateRandomName(this.name,basic_settings.scriptName);
	  		
		}
		

		
	

		this.disableInputs();
		return basic_settings;

	}	
	

})