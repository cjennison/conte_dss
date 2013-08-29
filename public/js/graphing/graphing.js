var Graphing = {
	minimizedGraphs : [],
	graphs : [],
	coords : [],
	
	init : function(num){
		var rows = 1,
			cols = 1,
			barWidth = 90,
			xBar = [],
			marginBar = 5,
			barContainerWidth = [],
			x = 0,
			y = 0,
			margin = 80,
			height = 350,
			width = 590,
			n = 0,
			j = 0,
			zoomTop = [],
			zoomLeft = [];
			/*stepdata = JSON.parse(data);
			console.log('++++++++++++++++++++++++++++')
			console.log('++++++++++++++++++++++++++++')
			console.log('++++++++++++++++++++++++++++')
			console.log(stepdata.length);
			console.log('++++++++++++++++++++++++++++')
			console.log('++++++++++++++++++++++++++++')
			console.log('++++++++++++++++++++++++++++')
			*/
		for(var i = 0; i < num; i++){
			var shadow_box = $("<div id='graphShadowBox'></div>");
			
			var div = $('#graphBoxContainer');
			var graph_div = $("<div class='graphDiv' id='graphBox" + i + "' data-disabled='false' zoomed='false' graph_num=" + i + "></div>");
			var graph_minimizeHandle = $("<div id='minimize_handle'></div>");
			var graph_maximizeHandle = $("<div id='maximize_handle'></div>");

			var bar = $('#graphBar');
			var graphBar_div = $("<div class='graphDiv'  data-disabled='true' zoomed='false' graph_num=" + i + "><p></p></div>");

			$(bar).append(graphBar_div);
			
			$(graph_div).css('left', (x + ((cols - 1) * (width + margin))) + 'px');
			$(graph_div).css('top', (y + ((rows - 1) * (height + margin))) + 'px');
			$(graphBar_div).attr('hidden', true);
			
			$(graph_div).append(graph_minimizeHandle);
			$(graph_div).append(graph_maximizeHandle);
			$(div).append(graph_div);
			
			$(graph_div).hide();
						
			xBar[i] = marginBar + (100 * i);
			barContainerWidth[i] = 105 + (100 * i);
			var xy = {
				x : x + ((cols - 1)*(width + margin)),
				y : y + ((rows - 1)*(height + margin))
			}
									
			Graphing.coords.push(xy);
			
			cols++;
			if (cols > 2){
				cols = 1;
				rows ++;
			}
		
		$(graph_div).find("#minimize_handle").click(function(){
			var parentGraphNum = $(this).parent().attr('graph_num');
			$(this).parent().attr('data-disabled', 'true');
			$('#graphBar [graph_num="' + parentGraphNum + '"]').attr('data-disabled', 'false');
						
			for(var i = 0; i < num; i++){
				var graphBarIdentifier = $('#graphBar .graphDiv')[i];
				var graphIdentifier = $('#graphBoxContainer .graphDiv')[i];			
				
				graphIdentifier = $(graphIdentifier).attr('data-disabled');
				graphBarIdentifier = $(graphBarIdentifier).attr('data-disabled');
				
				var zoomed = $('#graphBoxContainer [graph_num="' + i + '"]').attr('zoomed');
				
				if (graphIdentifier == 'true'){
					$('#graphBoxContainer [graph_num="' + i + '"]').hide();
					$('#graphBar [graph_num="' + i + '"]').fadeIn(1000);
				}
				else{
					$('#graphBoxContainer [graph_num="' + i + '"]').css('top', Graphing.coords[n].y + 'px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('left', Graphing.coords[n].x + 'px');
					n++;
				}
				if (graphBarIdentifier == 'false'){
					$('#graphBar [graph_num="' + i + '"]').css('left', xBar[j] + 'px');
					$('#graphBar').css('width', barContainerWidth[j] + 'px');
					j++;
				}
				if (zoomed == 'true'){
					$(shadow_box).detach();
				}
				
			}
			n = 0;
			j = 0;
		});
		
		$(graphBar_div).click(function(){
			$(this).fadeOut(1000);
			
			var parentBarNum = $(this).attr('graph_num');
			$(this).attr('data-disabled', 'true');
			$('#graphBoxContainer [graph_num="' + parentBarNum + '"]').fadeIn(1000);
			$('#graphBoxContainer [graph_num="' + parentBarNum + '"]').attr('data-disabled', 'false')
			
			for(var i = 0; i < num; i++){
				var graphIdentifier = $('#graphBoxContainer .graphDiv')[i];
				graphIdentifier = $(graphIdentifier).attr('data-disabled');
				
				var zoomed = $('#graphBar .graphDiv')[i];
				zoomed = $(zoomed).attr('zoomed');
				
				var graphBarIdentifier = $('#graphBar .graphDiv')[i];
				graphBarIdentifier = $(graphBarIdentifier).attr('data-disabled');
				
				if (graphIdentifier == 'false'){
					$('#graphBoxContainer [graph_num="' + i + '"]').css('top', Graphing.coords[n].y + 'px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('left', Graphing.coords[n].x + 'px');
					if (zoomed == 'true'){
						$('#graphBar [graph_num="' + i + '"]').attr('zoomed', 'false');
						$('#graphBoxContainer [graph_num="' + i + '"]').attr('zoomed', 'false');
						$('#graphBoxContainer [graph_num="' + i + '"]').css('width', '590px');
						$('#graphBoxContainer [graph_num="' + i + '"]').css('height', '350px');
						$('#graphBoxContainer [graph_num="' + i + '"]').css('position', 'absolute');
						$('#graphBoxContainer [graph_num="' + i + '"]').css('margin', '0px');
						$('#graphBoxContainer [graph_num="' + i + '"] #maximize_handle').css('background-image', 'url(../images/maximize_for_graphs.png)')
						$('#graphBoxContainer [graph_num="' + i + '"]').css('z-index','0');
						}
					n++;
				}
				if (graphBarIdentifier == 'false'){
					$('#graphBar [graph_num="' + i + '"]').css('left', xBar[j] + 'px');
					$('#graphBar').css('width', barContainerWidth[j] + 'px');
	 				j++;
				}
			}
			n = 0;
			j = 0;
		});
		
		$(graph_maximizeHandle).click(function(){
			var zoomed = $(this).parent().attr('zoomed');
			var graphNum = $(this).parent().attr('graph_num');
			
						
			if (zoomed == 'false'){
				
				zoomTop = $(this).parent().css('top');
				zoomLeft = $(this).parent().css('left');
				
				$('#graphBar [graph_num="' + graphNum + '"]').attr('zoomed', 'true');
				$(this).parent().attr('zoomed', 'true');
				$(this).parent().css('top','50%');
				$(this).parent().css('left','50%');
				$(this).parent().css('margin-top','-350px');
				$(this).parent().css('margin-left','-550px');
				$(this).parent().css('position', 'fixed');
				$(this).parent().css('z-index', '100');
				$(this).parent().css('width', '1180px');
				$(this).parent().css('height', '700px');
				$(this).css('background-image', 'url(../images/restore_down_for_graphs.png)');
				$(this).parent().parent().append(shadow_box);
				console.log("ADDED ZOOM CLASS")
				console.log($(this).parent().parent());
				var graphbox = $(this).parent();
				console.log(graphbox);
				//console.log($(graphbox + ' svg');
				$(graphbox).find("svg").attr("class", "svg_zoomed");
				console.log($(graphbox).find("svg"));
			}
			else{
				$(this).parent().attr('zoomed', 'false');
				$(this).parent().css('top', zoomTop);
				$(this).parent().css('left', zoomLeft);
				$(this).parent().css('margin-top','0px');
				$(this).parent().css('margin-left','0px');
				$(this).parent().css('position', 'absolute');
				$(this).parent().css('z-index', '0');
				$(this).parent().css('width', '590px');
				$(this).parent().css('height', '350px');
				//$(this + " svg").removeClass("svg_zoomed");
				$(this).css('background-image', 'url(../images/maximize_for_graphs.png)');
				$(shadow_box).detach();
				console.log("REMOVED ZOOM CLASS")
				var graphbox = $(this).parent();

				$(graphbox).find("svg").attr("class", "");

			}
		});
		$(shadow_box).click(function(){
			$(shadow_box).detach();
			for (i = 0; i < num; i++){
				var zoomed = $('#graphBoxContainer [graph_num="' + i + '"]').attr('zoomed');
				if (zoomed == 'true'){
					$(shadow_box).css('z-index', '99');
					$('#graphBar [graph_num="' + i + '"]').attr('zoomed', 'false');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('top', zoomTop);
					$('#graphBoxContainer [graph_num="' + i + '"]').css('left', zoomLeft);
					$('#graphBoxContainer [graph_num="' + i + '"]').attr('zoomed', 'false');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('width', '590px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('height', '350px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('position', 'absolute');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('margin', '0px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('z-index', '0');
					$('#graphBoxContainer [graph_num="' + i + '"] #maximize_handle').css('background-image', 'url(../images/maximize_for_graphs.png)')
					console.log("REMOVED ZOOM CLASS")
					//var graphbox = $(this).parent();

					$('#graphBoxContainer [graph_num="' + i + '"]').find("svg").attr("class", "");

				}
			}
		})
	}
	 
	 
	
	},
	
	plotGraphs : function(stepID){
		var d = $.post('/output/getAllGraphsOfStep', {stepID:stepID})
		//var d =$.post('/output/getBaseAndParent',{'stepID':stepID});
		var int = setInterval(function(){
			if(d.readyState == 4){
				clearInterval(int);
				Graphing.buildInteractiveGraphs(d.responseText);

				//Graphing.buildGraphInformation(d.responseText);
			}
		},1000);
	},


	buildInteractiveGraphs:function(data){
		var stepdata = JSON.parse(data);
		var stepdata = stepdata.config;
		console.log(stepdata);
		var graph_array = [];
		for(var i = 0; i < stepdata.graphTypes.length;i++){
			graph_array.push("#graphBox" + i + "");
			$("#graphBox" + i + "").show();
		}
		console.log(graph_array);
		AutoGraph.initialize(stepdata, false, graph_array);
		//$('#graphBoxContainer [graph_num="0"]').show();

		//AutoGraph.initialize(stepdata, false, ['#graphBoxContainer [graph_num="0"]','#graphBoxContainer [graph_num="1"]','#graphBoxContainer [graph_num="2"]','#graphBoxContainer [graph_num="3"]']);
	},
		
	buildGraphInformation : function(data){
		var stepdata = JSON.parse(data);
		j=0;
		$('#graphBoxContainer .graphDiv').css('backgroung-image','');
		for( i = stepdata.message.length - 1; i >= 0; i--){
			if (stepdata.message[i].step == 'barrier'){
				$('#graphBoxContainer [graph_num="' + j + '"]').css('background-image', 'url(http://' + document.location.host + '/' + stepdata.message[i].local_url + 'thumbnail.svg)');
				$('#graphBoxContainer [graph_num="' + j + '"]').show()
			}
			else if (stepdata.message[i].step == 'climate'){
				$('#graphBoxContainer [graph_num="' + j + '"]').css('background-image', 'url(http://' + document.location.host + '/' + stepdata.message[i].local_url + 'plot.svg)');
				$('#graphBar [graph_num="' + j + '"] p').text(stepdata.message[i].step);
				$('#graphBoxContainer [graph_num="' + j + '"]').show()
				j++			
				$('#graphBoxContainer [graph_num="' + j + '"]').css('background-image', 'url(http://' + document.location.host + '/' + stepdata.message[i].local_url + 'plot2.svg)');
				$('#graphBoxContainer [graph_num="' + j + '"]').show()
			}
			else if (stepdata.message[i].step == 'population'){
				$('#graphBoxContainer [graph_num="' + j + '"]').css('background-image', 'url(http://' + document.location.host + '/' + stepdata.message[i].local_url + 'plot3.svg)');
				$('#graphBar [graph_num="' + j + '"] p').text(stepdata.message[i].step);
				$('#graphBoxContainer [graph_num="' + j + '"]').show()
				j++	
				$('#graphBoxContainer [graph_num="' + j + '"]').css('background-image', 'url(http://' + document.location.host + '/' + stepdata.message[i].local_url + 'plot4.svg)');
				$('#graphBar [graph_num="' + j + '"] p').text(stepdata.message[i].step);
				$('#graphBoxContainer [graph_num="' + j + '"]').show()
			}
			else{
				$('#graphBoxContainer [graph_num="' + j + '"]').css('background-image', 'url(http://' + document.location.host + '/' + stepdata.message[i].local_url + 'plot.svg)');
				$('#graphBoxContainer [graph_num="' + j + '"]').show()
			}
			$('#graphBar [graph_num="' + j + '"] p').text(stepdata.message[i].step);
			$('#graphBoxContainer .graphDiv').css('background-size', 'contain');
			$('#graphBoxContainer .graphDiv').css('background-repeat', 'no-repeat');
			$('#graphBoxContainer .graphDiv').css('background-position', 'center');
			j++;
		}	
	}
}
