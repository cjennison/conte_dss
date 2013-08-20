var Status = {
	
	runningProcesses: [],
	
	init:function(){
		console.log("INIT STATUS");
		
		$("#navBar #navButton").bind('click', function(){
			if($("#navBar").attr("state") == "closed"){
				$("#navBar").addClass("active");
				$("#navBar").attr("state", "open");
				
				$(this).bind('mouseout', function(){
					setTimeout(function(){
						$("#navBar").removeClass("active");
						$("#navBar").attr("state", "closed");
					}, 4000)
				})
			} else {
				$("#navBar").removeClass("active");
				$("#navBar").attr("state", "closed");
			}
		});
		
		$("#loginBar #loginButton").bind('click', function(){
			if($("#loginBar").attr("state") == "closed"){
				$("#loginBar").addClass("active");
				$("#loginBar").attr("state", "open");
				
				$(this).bind('mouseout', function(){
					setTimeout(function(){
						$("#loginBar").removeClass("active");
						$("#loginBar").attr("state", "closed");
					}, 4000)
				})
			} else {
				$("#loginBar").removeClass("active");
				$("#loginBar").attr("state", "closed");
			}
		});
		
		$("#statusBar #statusButton").bind('click', function(){
			if($("#statusBar").attr("state") == "closed"){
				$("#statusBar").addClass("active");
				$("#statusBar").attr("state", "open");
				
				$(this).bind('mouseout', function(){
					setTimeout(function(){
						$("#statusBar").removeClass("active");
						$("#statusBar").attr("state", "closed");
					}, 4000)
				})
			} else {
				$("#statusBar").removeClass("active");
				$("#statusBar").attr("state", "closed");
			}
		});
	},
	
	addQueue:function(queueObject){
		var queueList = $("#statusBar ul");
		var listItem = $("<li class='statList' alias=" + queueObject.alias + "></li>");
		console.log(queueObject)
		var name = $("<span class='runtitle'>" + queueObject.alias + "</span>")
		var status = $("<span class='status'>Processing..</span>")
		$(listItem).append(status);
		$(listItem).append(name);
		
		$(listItem).bind('click', function(){Status.gotoOutputWithRun(this)});

		var statListWidth = $(listItem).css('width');
		console.log(statListWidth)
		console.log('+++++++++++++++++++++++++++++++++++++')
		
		$(queueList).append(listItem);
		
		if($("#statusBar").attr("state") == "closed"){
				$("#statusBar").addClass("active");
				$("#statusBar").attr("state", "open");
				
				setTimeout(function(){
						$("#statusBar").removeClass("active");
						$("#statusBar").attr("state", "closed");
					}, 4000)
			}
			
			setTimeout(function(){$(listItem).addClass("active")},20);
	},
	
	clearQueueObject:function(runName, result){
		console.log(runName);
		var lists = $(".statList");
		for(var i = 0;i<lists.length;i++){
			if($(lists)[i].getAttribute("alias") == runName){
				var span = $(lists)[i].children[0];
				console.log($(span).html());
				$(span).html(result);
				
				
			}
		}
		
		
		
		
				$("#statusBar").addClass("active");
				$("#statusBar").attr("state", "open");
				
				$(this).bind('mouseout', function(){
					setTimeout(function(){
						$("#statusBar").removeClass("active");
						$("#statusBar").attr("state", "closed");
					}, 4000)
				})
			
	 Streams.app_control.apps.weather_models.enableInputs();
	 Streams.app_control.apps.land_use_models.enableInputs();
	 Streams.app_control.apps.environmental_models.enableInputs();
	 Streams.app_control.apps.stream_flow_models.enableInputs();
	 Streams.app_control.apps.fish_models.enableInputs();
	},
	
	gotoOutputWithRun:function(info){
		console.log(info);
		initOutput();
		$("#inputWrapper").css("top","-100%");
		$("#outputWrapper").css("top","0%");
		$("#graphWrapper").css("top","100%");
				$(".panelBackground").css("opacity", .9);

	}

};