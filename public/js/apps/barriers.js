var barrier = Step.extend({
	name:'barrier',
	dom:'#barriers-app',
	
	start:function(){
		this._super();
		var that = this;	
		
	},

	getRuns:function(){
		this.getDams();
		this._super();
	},



	populateInput:function(options, isDOM){
		var data = this._super(options, isDOM);
		var that = this;
		var post;
		post = $.post('/database/barrier-settings', {'stepID':data.stepID})
		
					
		function checkData(){
			setTimeout(function(){
				if(post.readyState == 4){
					var resp = JSON.parse(post.responseText);
					that.populateDamInfo(resp, isDOM);
				} else {
					checkData();
				}
			},100)
		}
		
		checkData();

	},

	populateDamInfo:function(dam_settings, isDOM){
		var setting = dam_settings.step.settings.barrier_settings;
			
			var bar_list = $("#barriers-app #barriers-container .bar_item");
	  		for(var i = 0;i<setting.length;i++){
	  			var checked;
	  			if(setting[i].clip == "clip_catchment"){
	  				checked = true;
	  			} else {
	  				checked = false;
	  			}
	  			$("#barriers-app #barriers-container [data-id='" + setting[i].damID + "']" ).find(".bar_check").prop("checked", checked);
	  			
	  		}

			if(isDOM == true){
				this.setDependents(dam_settings.step.stepID);
			}
		
	},



	getDams:function(){
		console.log("GETTING DAMS");
		var that = this;
		var basin = Streams.app_control.apps.barrier.basin;
		$("#barriers-app #barriers-container").empty();

		var url  = 'http://' + document.location.host + '/' + basin.id + '/dams.json';
		var damRequest = $.getJSON(url, function(data){
			that.populateDams(data);
		})

	},

	populateDams:function(data){
		//Window
		var application = $("#barriers-app #barriers-container");
		$("#barriers-app #barriers-container").empty();
		//List
		var list = $("<ul id='barrier-list' style=''></ul>");
		$(list).empty();
		for(var i = 0;i < data.length;i++){
			var item = data[i];
			var li = $("<li id='bar" + i + "' class='bar_item' clip='ignore' data-id='" + item.UNIQUE_ID +  "' style='width='300px'>" + item.DAM_NAME + "<br /> " + item.description + "<input class='bar_check' type='checkbox' style='opacity:1;margin-left: 36px;margin-top: -14px;position:static;float:right;'></li>")
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
		
		var inputs = $("#barriers-app #barriers-container .bar_item input");

	},

	execute:function(){
		var vars = this._super();
		/*
		var barrier_model = this.getInfo();

		Status.addQueue(barrier_model);


		var serverResponse = $.post('/execute-step', {
			"webInfo":{
				"barrier":barrier_model,
			}
		});

		
		this.startCheck(serverResponse);
		*/

	},

	createAndRefresh:function(){
		this._super();
		Streams.app_control.apps.climate.getRuns();
		Streams.app_control.apps.land.getRuns();
		Streams.app_control.apps.flow.getRuns();	
		Streams.app_control.apps.streamtemp.getRuns();
		Streams.app_control.apps.population.getRuns();
		clearThumbnailsFromChild(1);

	},

	

	
	getInfo:function(){
		var vars = this._super();
		var barrier_settings = [];
		var bar_list = $("#barriers-app #barriers-container .bar_item");
	  	for(var i = 0;i<bar_list.length;i++){
	  		var obj = {};
	  		obj.damID = $(bar_list[i]).attr("data-id");
	  		obj.clip = $(bar_list[i]).attr("clip");
	  		barrier_settings.push(obj);
	  	}
		
		var barrier_model = {
	  		step:"barrier",
	  		alias:vars.run_alias,
			scriptName:"clip_basin_by_barrier",
	  		basin_id:vars.basin_id,
	  		barrier_settings:barrier_settings,
	  		existing_step_id:vars.stepID,
			skipped:vars.skipped,
	  	}

		return barrier_model;

	}
});