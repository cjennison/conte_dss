/* The AppControl module
 */
Streams.app_control = {
  name : 'AppControl',
  apps : { },
  apps_array : [],
  accordionLimit: Math.floor($(window).width() / 475) - 1,
  accordionsOpen: 0,
  canExtend : true,
  openAccordions: [],
  spliceArray: [],
  
  initActiveStep: function(){},
  
  init : function () {
  	
  	Streams.app_control.getCacheUpdate();
  	
    this.view = $('<div id="app-control">');
    
	
	$(function(){
			var screenWidth = $(window).width();
			Streams.app_control.accordionLimit = Math.floor(screenWidth / 475) - 1;
			
			$(window).resize(function(){
				var screenWidth = $(window).width();
				Streams.app_control.accordionLimit = Math.floor(screenWidth / 475) - 1;
			});			
		});
		
		
		//Always Run Me
		var process = setInterval(function(){
					Streams.app_control.getStatus();
				}, 3000);
   
  },
  
  closeAccordions: $(window).resize(function(){
  	var accordions = $("#accordion li.accord-li");
  	for(var i = 0; i < accordions.length; i++){
		$(accordions[i]).attr("state", "closed");
		$(accordions[i]).css('width', "30px");
	}
	Streams.app_control.accordionsOpen = 0;
	Streams.app_control.openAccordions = [];
	}),

  
  getCacheUpdate: function(){
  	
  },
  
  //Init Basin Selection
  initBasinSelection: function(){
  	
  	//Create Container
  	var basin = $('#basinSelection');
  	$(basin).addClass('basinSelection-control');
  	//Create According
  	var basinAccordion = $('.basinSelector');
  	$(basin).append(basinAccordion);
  	
  	var basinLi = $('<li></li>')
  	 basinAccordion.append(basinLi);
  	
  	
  	//Get Basin Selection Application
  	var basinApp = this.apps.basin;
  	basinApp.init();
  	
  	//Place Header on Accordion
  	var header  = $('<div class="toggle" state="open">'+ '<span class="title">Basin</span></div>');
      basinLi.append(header);
    var content  = $('<div class="content" ></div>');
      content.append(basinApp.view);
       basinLi.append(content);

  	var accordionOpts = {
      header    : 'h3',
      autoHeight : false,
    };

  },
  
  
  render : function () {
  	this.initBasinSelection();
  	this.initSteps();
  	
  	
  },
  
  //Starts Step Controls
  initSteps: function(){
  	$('#steps-controls').addClass("steps");
  	$('#logos').css("left", "10px");
  	$('#logos').css("bottom", "100px");
  	
  	$("#user").css("left", "50px");
  	$("#user").css("bottom", "100px");
  	
  	
  	//TODO: Turn into error function
  	$('#steps-controls').bind('click', function(){
		if(!$(this).hasClass('active')){
			var errorMessage = $('<div class="ErrorMessage"></div');
			var message = $('<span class="eMessage">Please Select a Basin</span>');
			$(errorMessage).append(message);
			$('body').append(errorMessage);
			
			
			
			setTimeout(function(){
				$(errorMessage).css('bottom', '100px');
				//
				setTimeout(function(){
					$(errorMessage).css('bottom', '0px');
					
					$(errorMessage).remove();
				}, 2000)
			}, 100)
		} 
  	})
  	
  	for (var name in this.apps){
  		if(name != "basin"){
  			//this.apps[name].init();
  		}
  	}

	Streams.app_control.apps.barrier = new barrier();
	Streams.app_control.apps.barrier.start();
	this.apps_array.push(Streams.app_control.apps.barrier);
	
	Streams.app_control.apps.climate = new climate();
	Streams.app_control.apps.climate.start();
	this.apps_array.push(Streams.app_control.apps.climate);

	Streams.app_control.apps.land = new land();
	Streams.app_control.apps.land.start();
	this.apps_array.push(Streams.app_control.apps.land);

	Streams.app_control.apps.flow = new flow();
	Streams.app_control.apps.flow.start();
	this.apps_array.push(Streams.app_control.apps.flow);
	
	Streams.app_control.apps.streamtemp = new streamtemp();
	Streams.app_control.apps.streamtemp.start();
	this.apps_array.push(Streams.app_control.apps.streamtemp);

	Streams.app_control.apps.population = new population();
	Streams.app_control.apps.population.start();
	this.apps_array.push(Streams.app_control.apps.population);






	
  	
  	
	
  },
  
  refreshAllApps:function(){
  	for (var name in this.apps){
  		if(name != "basin"){
  			this.apps[name].getRuns();
  		}
  	}
  },
  
  removeLoader:function(){
  	$("#loadingWindow").remove();
  	$(".shadowBox").remove();
  },
  
  //Disable Steps Controls
  disableSteps: function(){
  		$('#steps-controls').removeClass("active");
  		for(var i=1;i<=7;i++){
  			$('#acc' + i + ' .toggle').unbind();
  		}
  	
  		$('#logos').css("right", "");
		$('#logos').css("left", "10px");
		
		$('#logos ul li').css("display", "inline-block");
		
		$('#logos').css("bottom", "100px");
		$('#logos').css("top", "");
		
		$("#user").css("left", "50px");
  		$("#user").css("bottom", "100px");
  		$("#user").css("right", "");
  		$("#user").css("top", "");
  		
  		$("#user").addClass("stepsState");
  		
  		for(var i=1;i<=7;i++){
  			$('#acc' + i + '.accord-li').css('width', "30px");
			$('#acc3'+ i).parent().attr("state", "closed");
  		}
  		
  		$("#acc1").css("display", "none")
  		$("#tree").removeClass("active");
		$('#basinSelection').css("display", "block");
		Streams.app_control.accordionsOpen = 0;

  },
  
  //Enable Steps Controls
  enableSteps: function(name){
  		Output.runInformation.getRuns(window.width, window.height/3.3);

  		//Add Loading Screen
	  	var body = $("#inputWrapper");
		var loadingPrompt = $("<div id='loadingWindow'><h1>Loading Runs..</hi><br><img src='images/ajax-loader.gif'></div>")
		$(body).append("<div class='shadowBox'></div>")
		$(body).append(loadingPrompt);
		
  		$("#navigationBar").css("display","block")
  		$('#steps-controls').addClass("active");
  		for(var i=1;i<=7;i++){
  			var amt = 480;
  			if(i == 1){
  				amt = 480
  			}
  			this.bindOpen("#acc" + i + " .toggle", amt);
  			this.bindClose("#acc" + i + " .toggle");
  			this.bindCloseIcon("#acc" + i + " .custom-ui-icon");
  		}
  				$('#logos ul li').css("display", "block");
		
		//TODO: Set Classes for each of these
		
		$('#logos').css("right", "50px");
		$('#logos').css("left", "");
		
		$('#logos').css("bottom", "");
		$('#logos').css("top", "0px");
		
		$("#user").css("left", "");
  		$("#user").css("bottom", "");
  		$("#user").css("right", "10px");
  		$("#user").css("top", "470px");
  		
  		$("#user").addClass("stepsState");

		$("#tree").addClass("active");
		
		$("#acc1").css("display", "block")
		$("#acc1 #basinTitle").html("Basin");
		$("#basin_name").html(Streams.app_control.apps.basin.basin.name);
		
		$("#acc1 #years_slider").slider(
			 { 
			max     : 80,
	        min     : 0,
	        range   : 'min',
	        value   : 30,
	        animate : 'fast',
	        slide   : function (event, ui) {
	          $("#acc1 .years").text(ui.value);
	          Streams.yearRange = ui.value;
	          Streams.graphs.updateDate(ui.value);
	        }
	      }
		)
		
		$('#basinSelection').css("display", "none");

		for(i = 1; i < 8; i++){
			if (i <= Streams.app_control.accordionLimit){
				if (i == 1){
					$("#acc1").css('width', '480px');
				}
				else{		
					$("#acc" + i).css('width', '480px');
				}
				
			 	Streams.app_control.openAccordions.push("acc" + i);
			 	$("#acc" + i).attr('state', 'open');
			 	Streams.app_control.accordionsOpen++
			}			
		}
		
		Streams.app_control.apps.climate.getRuns();
		Streams.app_control.apps.land.getRuns();
		Streams.app_control.apps.flow.getRuns();
		Streams.app_control.apps.streamtemp.getRuns();
		Streams.app_control.apps.population.getRuns();
		Streams.app_control.apps.barrier.getRuns();
		//Streams.app_control.apps.climate.setNewRun();
		

  },
  
  /**
   *Binds the target to open itself 
   */
  bindOpen: function(target, amt){
		$(target).bind('mousedown', function(event){
			var accNum = $(this).parent().attr("id")
			if (Streams.app_control.canExtend == false){return; }
			Streams.app_control.canExtend = false;	 
					
			if($(target).parent().attr("state") == "closed" ){
				$(target).parent().css('width', amt + "px");
				var activate = setTimeout(function(){
					$(target).parent().attr("state", "open");
				}, 300);
				Streams.app_control.accordionsOpen++;
				Streams.app_control.openAccordions.push(accNum)
			}
			if(Streams.app_control.accordionsOpen > Streams.app_control.accordionLimit){
				var accToClose = Streams.app_control.openAccordions.shift()
				var accToClose = $("#" + accToClose)
				
				$(accToClose).attr("state", "closed");
				$(accToClose).css("width", "30px");
				Streams.app_control.accordionsOpen--;
				
				
			}
			
			
			var contentWidth = $(window).width()/Streams.app_control.accordionsOpen;
				if (Streams.app_control.accordionsOpen == 0){
					var contentWidth = 0;
				}
				contentWidth = contentWidth *.67;
				if (Streams.app_control.accordionLimit == 1){
					contentWidth = contentWidth * .63;
				}
				for (i = 1; i < 8; i++){
				
					var accordion = $('#acc' + i);
					if ((accordion).attr("state") == "open"){
						$(accordion).css('width',contentWidth + 'px');
						
					}
					else{
						$(accordion).css('width', '30px')
					}
				}
			
			setTimeout(function(){
				Streams.app_control.canExtend = true;
			},301);

			
		});
  },

  /**
   *Binds the target to close itself 
   */
  bindClose: function(target){
		$(target).bind("mousedown", function(){
			var accNum = $(this).parent().attr("id")
			if($(target).parent().attr("state") == "open" ){
				var accToClose = Streams.app_control.openAccordions.indexOf(accNum)
				Streams.app_control.openAccordions.splice(accToClose,1);
				
				$(target).parent().css('width', "30px");
				var activate = setTimeout(function(){
					$(target).parent().attr("state", "closed");
				}, 300);
				Streams.app_control.accordionsOpen--;
			}
			
			setTimeout(function(){
				var contentWidth = $(window).width()/Streams.app_control.accordionsOpen;
				if (Streams.app_control.accordionsOpen == 0){
					var contentWidth = 0;
				}
				contentWidth = contentWidth *.67;
				if (Streams.app_control.accordionLimit == 1){
					contentWidth = contentWidth * .63;
				}
				for (i = 1; i < 8; i++){
				
					var accordion = $('#acc' + i);
					if ((accordion).attr("state") == "open"){
							$(accordion).css('width',contentWidth + 'px');
					}
					else{
						$(accordion).css('width', '30px')
					}
				}
			},301);
		});
		
  },
  
  bindCloseIcon: function(target){
		$(target).bind("mousedown", function(){
			if($(target).parent().parent().parent().attr("state") == "open" ){
				$(target).parent().parent().parent().css('width', "30px");
				var activate = setTimeout(function(){
					$(target).parent().parent().parent().attr("state", "closed");
				}, 300);
				Streams.app_control.accordionsOpen--;
			}
		});
  },

  
  
  /**
   *Adds a class to the selected element  
 * @param {Object} div The Element you are referencing
 * @param {Object} className The class you are adding to the element
   */
  addClass: function(div, className){
  	$(div).addClass(className);
  },
  
  /**
   *Removes class from the selected Element 
 * @param {Object} div Element to reference
 * @param {Object} className Class to remove
   */
  removeClass: function(div, className){
  	if($(div).hasClass(className)){
  		$(div).removeClass(className);
  	} else {
  	}
  },
  
  generateRandomName:function(step,script){
  	var result = step + '_' + script + '_' + (Math.round(Math.random()*9999));
  	return result;
  },
  
  addThumbnail:function(dir){
  },
  
  getStatus:function(){
  	for(var w = 0;w < Status.runningProcesses.length;w++){
  		var process = Status.runningProcesses[w];
  		process = Output.runInformation.parseResponse(process.responseText);
  		process = Output.runInformation.parseResponse(process);
		for(var k = 0;k < process.run.length;k++){
			var step = process.run[k];
			if(step.status != "COMPLETED"){
				Cache.saveStep(step.stepID, step.status);
			}
		}
		
		
		if(process.run[process.run.length - 1].status == "COMPLETED"){
			Graphing.plotGraphs(process.run[process.run.length - 1].stepID);
			Status.runningProcesses.splice(w-1, 1);
			Output.buildHistory();

			for(var k = 0;k < process.run.length;k++){
				var step = process.run[k];
				Cache.saveStep(step.stepID, step.status);
				
			}
				Streams.app_control.addThumbnail(process.run);
				//Status.clearQueueObject(data.alias, "COMPLETED"); TODO: FIX THIS
				Output.runInformation.getRuns();
		}
		
  		if(process.run[process.run.length - 1].status == "QUEUED" || process.run[process.run.length - 1].status == "EXECUTED"){
  			//Needs to be rechecked (ie, not done yet)
  			var runStatus = $.post('/mexec/status', {"runID":process.run[process.run.length - 1].stepID}).done(function(){
	  				Status.runningProcesses[w-1] = runStatus;
  			})

  		}
  		
  		for (i = 0; i < process.run.length; i++){
  			for(j = 0;j < Streams.app_control.spliceArray.length; j++){
  				process.run.splice(Streams.app_control.spliceArray[j],1)
  			}
  			if (process.run[i]){
	  			var splice = Thumbnails.updateThumbnail(process.run[i]);
	  			if (splice == true){
	  				Streams.app_control.spliceArray.push(i);
	  			}
  			}
  		}
  	}
  },
  
  
 
  
};
