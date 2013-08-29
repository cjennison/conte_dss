var Thumbnails = {
	thumbListNumber : 0,
	positionArray : [],
	thumbnailList: [],
	
	createPositionArray : $(function(){
		x = 0;
		for (i=0;i<7;i++){
			Thumbnails.positionArray[i] = x;
			x = x + 225;
		}
	}),
	
	buildThumbUl : function(){
		Thumbnails.thumbListNumber++;
		var ullist = $("#thumbnailList");
		var runButton = $("<button id='runModels'><span>Run Now</span></button>")
		$(runButton).button();
		var thumb_ul = $("<li><ul id='thumbList" + Thumbnails.thumbListNumber + "'></ul></li>");
		
		$(ullist).append(thumb_ul);
		$(ullist).append(runButton);
		
		
		$("#runModels").click(function(e){
			Thumbnails.queueThumbnails();
			for(var i = Streams.app_control.apps_array.length - 1; i >= 0; i--){
				if(Streams.app_control.apps_array[i].state == "NEW RUN"){
					
					Streams.app_control.apps_array[i].execute();
					break;
				}
			}
 		 });
		Thumbnails.buildThumbnails(0,"SAVED RUN",null,Streams.app_control.apps.basin.basin.thumbnail)
		
	},
	
	buildThumbnails : function(position,state,skipped,url){
		var ul = $("#thumbnailList li #thumbList" + Thumbnails.thumbListNumber);
		var div = $("<div class='thumbnailImage' text=false id=image" + position + "></div>");
		
		var dropdown = $('<div class=dropdownList></div>');
		
		var buttonContainer = $('<div class="buttonContainer"></div>');
		var graphButton = $('<button class="dropdownButton" style="width: 110px;">Graphs</button>').button();
		var runButton = $('<button class="dropdownButton" style="width: 110px;">Run Log</button>').button();
		
		buttonContainer.append(graphButton);
		buttonContainer.append(runButton);
		dropdown.append(buttonContainer);
		
		$(graphButton).bind("click", function(){
			$("#inputWrapper").css("top","-200%");
			$("#outputWrapper").css("top","-100%");
			$("#graphWrapper").css("top","0%");
		});
		
		$(runButton).bind("click", function(){
			initOutput();
			$("#inputWrapper").css("top","-100%");
			$("#outputWrapper").css("top","0%");
			$("#graphWrapper").css("top","100%");
			$("#outputWrapper").css("left","-100%");
			$(".panelBackground").css("opacity", .9);
		});
		
		for (i=7;i>=position;i--){
			var oldDiv = $("#thumbnailList #image" + i);
			$(oldDiv).remove();
		}		
		
		$(div).css('left', Thumbnails.positionArray[position] + 'px');
		$(ul).append(div)
		
		if (position != 0){
			url = "http://" + document.location.host + '/' + url + "thumbnail.svg"
		}
		
		if (state != "SAVED RUN"){
			if (state != "NO MODEL"){
				$(div).append("<p id=status>Ready to Run</p>");
				$(div).attr("text","true");
				
				
			}
		}
		//The run is completed
		else{
			$(div).removeClass("new_run");
			$(div).css("background-image", "url(" + url + ")");
			$(div).css("background-size", "100% 100%");
			
		}
		
		if (skipped == "true" || state == "NO MODEL"){
			$(div).addClass("skipped_run");
		}
		
		$(div).mouseover(
  		function(){
  			$(".dropdownList").detach();
  			$(this).before(dropdown);
  			$(dropdown).css("left", Thumbnails.positionArray[position] + 'px');
  		});
  		
  		$("#thumbnailList").hover(
	  		function(){},
	  		function(){
	  			$(".dropdownList").detach();
	  		}
	  	);
	  	
	},
	
	queueThumbnails : function(){
		for (i = 1; i <= 7; i++){
			if($("#thumbnailList li #thumbList" + Thumbnails.thumbListNumber + " #image" + i).attr("text") == "true"){
				$("#thumbnailList li #thumbList" + Thumbnails.thumbListNumber + " #image" + i + " p").remove();
				$("#thumbnailList li #thumbList" + Thumbnails.thumbListNumber + " #image" + i).append("<p id=status> WAITING </p>");
			}
			

		}
	},
	
	updateThumbnail : function(run){
		console.log(run)
		var name = run.alias;		
		var thumbnail = $("#thumbnailList li #thumbList" + Thumbnails.thumbListNumber + " #image" + run.position)
		var url = run.stepID;
		var step = run.step;
		
		var url = "http://" + document.location.host + '/' + Streams.user + '/' + step + '/' + url + "/thumbnail.svg";
		$("#thumbnailList li #thumbList" + Thumbnails.thumbListNumber + " #image" + run.position + " p").remove();
		if (run.skipped == "false"){
			if (run.status == "COMPLETED"){
				$(thumbnail).removeClass("new_run");

				$(thumbnail).css("background-image", "url(" + url + ")");
				$(thumbnail).css("background-size", "100% 100%");
				return true;
			}
			else{
				if (run.status == "EXECUTED"){			
					$(thumbnail).append("<p id=name>" + name + "</p>");
					$(thumbnail).addClass("new_run");
					$(thumbnail).append("<p id=status> RUNNING </p>");
					return false;
				}
				else if (run.status == "FAILED"){
					$(thumbnail).removeClass("new_run");

					$(thumbnail).append("<p id=name>" + name + "</p>");
					$(thumbnail).append("<p id=status> MODEL ERROR </p>");
				}
				else{
					$(thumbnail).append("<p id=name>" + name + "</p>");
					$(thumbnail).removeClass("new_run");

					$(thumbnail).append("<p id=status>" + run.status + "</p>");	
				}
			}
		}
		else{
			return true;
		}
	},
}
