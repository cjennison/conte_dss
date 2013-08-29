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
	skipped:true,
	state:"NO MODEL", //COMPLETED, NO MODEL
	type:null,
	managed:false,
	position:-1,
	unable_to_run:false,
	
	getRuns: function(){
		var that = this;
		//console.log(this);
		
		this.setNoRun(true);
		var runs = $.post('/users/script/runs', {'scriptname': this.name, 'basin_id':Streams.app_control.apps.basin.basinId});
		//console.log(runs);
		var check = setInterval(function(){
			console.log("[STEP]");

			if(runs.readyState == 4){
				clearInterval(check);
				//console.log(run);
				var data = Output.runInformation.parseResponse(runs.responseText);
				
				that.populateRunList(data);
			}
		}, 1000);
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
		selectorList.append($("<option style='opacity:.5'>Select Run from Dropdown</option>"));
		//selectorList.append($("<option>Skip this Step</option>"));



		
		
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
			if($(that.dom + " .runTypeSelect .selectRun option:selected").html() == "Select Run from Dropdown"){
				//that.createAndRefresh();
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
		if(this.config == null){ 
			console.log("NO CONFIG");
			return; 
		}
		for(var i = 0;i<this.config.length;i++){
			var script = this.config[i].script,
			      reqs = this.config[i].requirements;

			if(this.config[i].disabled == true){
				console.log("DISABLED SCRIPT: " + script);
				$("select option").filter(function() {
   							 return $(this).val() == script; 
							}).prop('disabled', true);	
				
			} else {
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
							console.log("I HAVE ENCOUNTERED AN ERROR");
							break;
						} else {
							$("select option").filter(function() {
   								 return $(this).val() == script; 
								}).prop('disabled', false);	

						}
						console.log(j + " out of " +(reqs.length - 1));	
						
						if(j == (reqs.length - 1)){
							$("select option").filter(function() {
   								 return $(this).val() == script; 
								}).prop('disabled', false);	
							this.unable_to_run = false;	

						}			
					}				
				}
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
		//console.log(num_disabled + " : " + opts.length); 
		if(num_disabled == opts.length && num_disabled > 0){
			console.log("DISABLING");
			this.disableInputs();
			this.unable_to_run = true;	
			this.state = "NO MODEL";
			$(this.dom + " #new-run-button").addClass("disable");	
			$(this.dom + " .NEW-RUN").css("display","none");
			$(this.dom + " .SAVED-RUN").css("display","none");
		
			$(this.dom + " .SAVED-RUN select").prop("disabled",false);
			var btns = $(this.dom + " .r-btn");
			console.log(btns);
			for(var i = 0;i < btns.length; i++){
				$(btns[i]).removeClass("active");
			}
			$(this.dom + " #no-run-button").addClass("active");
	
		} else {
			this.unable_to_run = false;	
			$(this.dom + " #new-run-button").removeClass("disable");		
		}
		if(this.state == "NO MODEL"){
			this.disableInputs();
		}
		console.log("THERE ARE THIS MANY DISABLED: " + num_disabled + " " + this.dom);
	},

	editSettings: function(options, isDOM){
		var data;
		var pre_thumblist = [];
		var that = this;
		this.skipped = false;

		//for(var name in Streams.app_control.apps){
			//if(name != 'basin'){
			//	Streams.app_control.apps[name].evaluateAvailableModels();
			//}
			
		//}


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
			//this.markThisAndParents("input");
			this.setSavedRun();
			var selectorList = $(this.dom + " .runTypeSelect .selectRun");
			$(selectorList).val(data.alias);
		}

		this.state = "SAVED RUN";

		that = this;
		//this.markThisAndParents("input");
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

				data.message.reverse();
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
				
				that.markThisAndParents("input");
				//that.buildThumbnailList(pre_thumblist);
	  		
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
			//var selectorList = $(this.dom + " .runTypeSelect .selectRun");
			//$(selectorList).val("Skip this Step");
			this.setNoRun();

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
		
		// START TOOL BAR
			console.log("RADIO BUTTONS");
			console.log($(this.dom + " .r-btn"));
			$(this.dom + " .r-btn").bind('click', function(e){
				
			
				

			});
			$(this.dom + " #new-run-button").click(function(e){
				if(that.unable_to_run == false){
					that.state = "NEW RUN";
					that.setNewRun();
				}
				
				
	
			})
			$(this.dom + " #saved-run-button").click(function(e){
					
				that.setSavedRun();

			})
			$(this.dom + " #no-run-button").click(function(e){
				that.state = "NO MODEL";	
				that.setNoRun();
			})



		// END TOOL BAR
				
		//$(this.dom + " .app_content").bind('click', function(e){
			
		//});		

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
		if(this.managed){
			//this.configureManagement();	
		}
		

			
		this.configureModels();
	},

	setNewRun:function(){
		console.log("SETTING A NEW RUN");
		this.state = "NEW RUN";
		this.markThisAndParents("input");
		this.createAndRefresh();

		$(this.dom + " .NEW-RUN").css("display","block");
		$(this.dom + " .SAVED-RUN").css("display","none");
		$(this.dom + " .NO-MODEL").css("display","none");

		$(this.dom + " .SAVED-RUN select").prop("disabled",false);
		var btns = $(this.dom + " .r-btn");
		console.log(btns);
		for(var i = 0;i < btns.length; i++){
			$(btns[i]).removeClass("active");
		}
		$(this.dom + " #new-run-button").addClass("active");
		this.checkNewModels();
	},

	setSavedRun:function(){
		$(this.dom + " .NEW-RUN").css("display","none");
		$(this.dom + " .SAVED-RUN").css("display","block");
		$(this.dom + " .NO-MODEL").css("display","none");

		this.skipped = false;
		
		this.disableInputs();
		$(this.dom + " .SAVED-RUN select").prop("disabled",false);
		var btns = $(this.dom + " .r-btn");
		console.log(btns);
		for(var i = 0;i < btns.length; i++){
			$(btns[i]).removeClass("active");
		}
		$(this.dom + " #saved-run-button").addClass("active");
		this.checkNewModels();

	},

	setNoRun:function(check){
		if(check == undefined){
			this.markThisAndParents("input");
		}
		
		this.skipStep();
		$(this.dom + " .NEW-RUN").css("display","none");
		$(this.dom + " .SAVED-RUN").css("display","none");
		$(this.dom + " .NO-MODEL").css("display","block");

		$(this.dom + " .SAVED-RUN select").prop("disabled",false);
		var btns = $(this.dom + " .r-btn");
		console.log(btns);
		for(var i = 0;i < btns.length; i++){
			$(btns[i]).removeClass("active");
		}
		$(this.dom + " #no-run-button").addClass("active");
		this.checkNewModels();
		
	},

	checkNewModels:function(){
		for(var i = Streams.app_control.apps_array.length - 1; i >= 0; i--){
				console.log(Streams.app_control.apps_array[i].state);
				if(Streams.app_control.apps_array[i].state == "NEW RUN"){
					$("#runModels").button({disabled:false})
					break;
				}
				console.log(i);
				if(i == 0){
					$("#runModels").button({disabled:true})
				}
		}
	},


	configureManagement:function(){
		var appContent = $(this.dom + ' .app_content');
		var manage_button = $("<button class='manage'>Manage</button>");
		$(appContent).append(manage_button);
		$(manage_button).button()

		var manage_panel = $("<div class='manage_panel'></div>");
		$(appContent).append(manage_panel);

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
			
			that.configureInputs();
			//that.evaluateAvailableModels();
			//if(this.state == "NO MODEL"){this.disableInputs()};
		})

	},
	
	configureInputs:function(){
		console.log("CONFIG");
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
					Streams.app_control.apps[requirements[req].step].state = "SAVED RUN";
					console.log(Streams.app_control.apps[requirements[req].step].getInfo());
				}
			}
	
			
		
		}
		this.state = "SAVED RUN";

		webInfo.push(this_model);
		//Status.addQueue(this_model);

		
		var serverResponse = $.post('/execute-step', {
			"webInfo":webInfo
		});

		
		this.startCheck(serverResponse);
		
		
		
		console.log(webInfo);
		
	},

	buildThumbnailList:function(list){
		var dropdown_url = list[0];
		list.splice(0, 1); 
		
		console.log("LIST");
		console.log(list);
		//list.reverse();
		list.push(dropdown_url);
		//Streams.app_control.addThumbnail(list);
		
		for(i = 0; i < list.length; i++){
			Thumbnails.buildThumbnails(i+1,"COMPLETED",list[i].url)
		}
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


	getInfo:function(source){
		console.log("Extend Running");
		console.log(source);
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
		

		console.log("SOURCE");
		console.log(source);
		if(source != "input"){
			this.disableInputs();
		}
		this.setSavedRun();
		//this.state = "SAVED RUN";
		return basic_settings;

	},

	markThisAndParents:function(source){
		var namelist = [];
		console.log(source);
		var src = source;
		var this_model = this.getInfo(src);

		var requirements;
		if(this.config != null){
			for(var sc = 0; sc < this.config.length; sc++){
				if(this.config[sc].script == this_model.scriptName){
					requirements = this.config[sc].requirements;
				}
			}

			if(requirements.length > 0){
				for(var req = 0;req < requirements.length;req++){
					var obj = {
						pos: Streams.app_control.apps[requirements[req].step].position,
						skipped:Streams.app_control.apps[requirements[req].step].skipped,
						state: Streams.app_control.apps[requirements[req].step].state, //step_id
						url: Streams.user + "/" + Streams.app_control.apps[requirements[req].step].name + "/" +  Streams.app_control.apps[requirements[req].step].step_id + "/"
					}
					namelist.push(obj);
				}
			}
	
			
		
		}

		
		
		var thisobj = {
						pos: this.position,
						skipped: this.skipped,
						state: this.state, //step_id
						url: Streams.user + "/" + this.name + "/" +  this.step_id + "/"
					}

		namelist.push(thisobj);

		for(var i = 0;i< namelist.length;i++){
			Thumbnails.buildThumbnails(namelist[i].pos, namelist[i].state,namelist[i].skipped, namelist[i].url);
		}
		console.log(namelist);

	},
	

})