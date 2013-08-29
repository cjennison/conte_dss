var Output = {
	
	currentDirectoryList: [],
	
	//TODO: Seperate these correctly
	defaultGraphs:[],
	populationGraphs:[],
		
	buildHistory:function buildHistory(){
		var runs = $.get("/database/all-runs").done(function(data){
			//console.log(data);
			var run_list = data.runs;
			
			var ul = $("#history-list"); //BASE OF ALL ENTRIES
			$(ul).empty();
						
			for(var i = 0;i < run_list.length;i++){
				populateRunList(run_list[i], ul);
			}
		})
	}
};

function sortHistory(sortItem){
	var runs = $.get("/database/all-runs").done(function(data){
		var run_list = data.runs;				
		var h = [0];
		filter = [];
		statusFilter = [];
		modelFilter = [];
		
		for(var i = 0;i < run_list.length; i++){
			var d = run_list[i][sortItem];
			var h = h.concat(d);
		}	
		
		var list = $("ul#history-labels li");
			for(var i = 0; i < list.length; i++){	
				if($(list[i]).attr("d-type") == sortItem){
					var sorter  = $(list[i]).attr('d-sorter');
					$(list[i]).attr('d-sorter', parseInt($(list[i]).attr('d-sorter')) * -1);
				}			
			}
		
		h.sort();
		
		if (sorter == -1){
			h.reverse();
		}
		
		
		var new_list = [];
		
		for (var thing in h){
			for (var item in run_list){
				if (h[thing] == run_list[item][sortItem]){
					new_list.push(run_list[item]);
				}
			}
		}
		
		var arr = new_list;
		var results = [];
		var idsSeen = {}, idSeenValue = {};
		for (var i = 0, len = arr.length, id; i < len; ++i) {
			id = arr[i].stepID;
			if (idsSeen[id] !== idSeenValue) {
				results.push(arr[i]);
				idsSeen[id] = idSeenValue;
			}
		}
		
		run_list = results;

		var ul = $("#history-list");
		$(ul).empty();
		
		for (i = 1; i < 15; i++){
			checked = $("#runList .filter .filterWindow #" + i).prop("checked");
			value =	$("#runList .filter .filterWindow #" + i).attr("value");
			
			if (checked == true){
				filter.push(value);
			}
		}
		
		for (i = 1; i < 5; i++){
			checked = $("#runList .filter .statusFilter #" + i).prop("checked");
			value = $("#runList .filter .statusFilter #" + i).attr("value");
			
			if (checked == true){
				statusFilter.push(value)
			}
		}
		
		for(i = 0; i < filter.length; i++){
			var modelString = filter[i].toString();
			var modelString = modelString + ".R";
			modelFilter.push(modelString);
		}

		
		if (filter[0] != null || statusFilter[0] != null){
			for(n = 0; n < run_list.length; n++){
				 if (statusFilter.indexOf(run_list[n].status) != -1 || statusFilter[0] == null){
				 	if (filter.indexOf(run_list[n].step) != -1 || modelFilter.indexOf(run_list[n].script) != -1 || filter[0] == null){
				 		populateRunList(run_list[n], ul);
					}
				}
			}
		}
		else{
			for(var i = 0;i < run_list.length;i++){
				populateRunList(run_list[i], ul);
			}
		}
	});
}

function populateRunList(run_list, ul){
	var d = run_list;
	var hist_item = $("<li class='history-item'></li>");
	var hist_ul = $("<ul></ul>")
	//alias
	var alias = $("<li><div class='history-box'>" + d.alias + "</div></li>");
	$(hist_ul).append(alias);
	//step
	var step = $("<li><div class='history-box'>" + d.step + "</div></li>");
	$(hist_ul).append(step);
	//script
	var script = $("<li><div class='history-box'>" + d.script + "</div></li>");
	$(hist_ul).append(script);
	//basinid
	var basinid = $("<li><div class='history-box'>" + d.basinid + "</div></li>");
	$(hist_ul).append(basinid);
	//time
	if(d.start_time != null){
		timeString = d.start_time.toString();
		var time = timeString.split(" - ");
		var timeString = time[0].toString() + "<br>";
		var time = $("<li><div class='history-box'>" + timeString + time[1] + "</div></li>");
	}
	else{
		var time =  $("<li><div class='history-box'>" + d.start_time + "</div></li>");
	}
	$(hist_ul).append(time);
	//status
	var status = $("<li><div class='history-box'>" + d.status + "</div></li>");
	$(hist_ul).append(status);
	//link
	var link = $("<li><div class='history-box'><a href='" + d.local_url + "output.zip' target='_blank'>LINK</div></li>");
	$(hist_ul).append(link);
				
	$(hist_item).append(hist_ul); 
	$(ul).append(hist_item);
}

function initOutput(){
	/*
	console.log("APPLYING RESIZE")
	var graphs = $('.outputgraph');
	for(var i = 0;i < graphs.length;i++){
		$(graphs[i]).css("z-index", "1");
		$(graphs[i]).resizable({
			aspectRatio: 5/4,
			containment: "#graph_container"

		});
		$(graphs[i]).draggable({
			containment: "#graph_container",
			scroll:false
		});
		
		$(graphs[i]).mousedown(function(e){
			var graphsx = $('.outputgraph');
			var highestZ = 0;
			for(var i = 0;i < graphsx.length;i++){
				//$(graphsx[i]).css("z-index", "1");
				if(parseInt($(graphsx[i]).css("z-index")) >= highestZ){
					highestZ = parseInt($(graphsx[i]).css("z-index")) + 1;
				}
			}
			
			$(e.target).css("z-index", highestZ)
			console.log(e);
		})	
	}
	*/
}

function storeGraphs(dir){
	/*
	console.log(dir);
	Output.populationGraphs = [];
	Output.defaultGraphs = [];
	for(var i = 0; i < dir.length; i++){
		if(dir[i].step == "population"){
			Output.populationGraphs.push('http://' + document.location.host + '/' + dir[i].url + '/plot1.svg');
			Output.populationGraphs.push('http://' + document.location.host + '/' + dir[i].url + '/plot3.svg');
			Output.populationGraphs.push('http://' + document.location.host + '/' + dir[i].url + '/plot4.svg');
	
		
		} else if (dir[i].step == "climate"){
			Output.defaultGraphs.push('http://' + document.location.host + '/' + dir[i].url + '/plot.svg');
			Output.defaultGraphs.push('http://' + document.location.host + '/' + dir[i].url + '/plot2.svg');
		} else if (dir[i].step == "land"){
			
		}else {
			Output.defaultGraphs.push('http://' + document.location.host + '/' + dir[i].url + '/plot.svg');
		}
	}
	
	console.log(Output.defaultGraphs);
	console.log(Output.populationGraphs);
	*/
}

function initDefaultGraphs(){
	/*
	console.log("DEFAULT");
	var graphs = $('.outputgraph');
	for(var i = 0;i < graphs.length;i++){
		$(graphs[i]).css("background", "url(" + Output.defaultGraphs[i] + ")");
		$(graphs[i]).css("background-size", "100% 100%");
	}
	*/
}

function initPopulationGraphs(){
	/*
	console.log("POPULATION")
	var graphs = $('.outputgraph');
	console.log(graphs);
	for(var i = 0;i < graphs.length;i++){
		$(graphs[i]).css("background", "url(" + Output.populationGraphs[i] + ")");
		$(graphs[i]).css("background-size", "100% 100%");
	}
	*/
}


function removeOutput(){
	/*
	$("#inputDropBox").css("display", "none");
	$('#graphSelectionList').remove();
	*/
}

function buildGraphBoxes(runArray){
	/*
	console.log(runArray);
	console.log("Initializing Outputs");
	
	$("#graphSelectionList").remove();
	
	$("#view_climate").button();
	
	$("#view_climate").click(function(){
		console.log("LOADING DEFAULTS")
		if(Output.defaultGraphs.length != 0){
			initDefaultGraphs();
			$("#inputWrapper").css("top","-200%");
		$("#outputWrapper").css("top","-100%");
		$("#graphWrapper").css("top","0%");
		}
	});
	
	$("#view_population").button();
	$("#view_population").click(function(){
		console.log("LOADING POPULATION")
		if(Output.populationGraphs.length != 0){
			initPopulationGraphs();
			$("#inputWrapper").css("top","-200%");
		$("#outputWrapper").css("top","-100%");
		$("#graphWrapper").css("top","0%");
		}
	});
	
	TODO: Figure out Output Graph Selection
	var graphContainer = $('#graphContainer');
	var graphSelectionList = $('<ul id="graphSelectionList">');
	
	var graphType = ["basin", "climate", "land", "flow", "temp","fish"];
	
	for(var q = 0; q < graphType.length; q++){
		var listItem = $("<li>");
		var graphUnorderedList = $("<ul id='" + graphType[q] + "GraphList' class='graphList'></ul>")
		
		$(listItem).append(graphUnorderedList);
		$(graphSelectionList).append(listItem);
		
	}
	
	$(graphContainer).append(graphSelectionList);
	
	
	for(var c = 0;c < runArray.length; c++){
		var list = $("#" + graphType[runArray[c].depth] + "GraphList");
		console.log(runArray[0]);
		var box = $("<div class='graphBox' style='color:black; font-size:12px'></div>")
		$(box).html(runArray[c].name)
		list.append(box);
	}
	
	
	
	var boxLength = $(".graphBox").length;
	
	for(var i = 0; i < boxLength; i++){
		DragHandler.attach($(".graphBox")[i]);
	}
	
	$("#inputDropBox").css("display", "none");
	*/
}

function filterHistoryResize(filter){
	filter = filter.value
	$("#runList .filter .filterWindow").css("display", "none");
	$("#runList .filter #" + filter).css("display", "block");
	
	var filterHeight = $("#runList .filter #" + filter).height() + 24;
	$("#runList .filter").css("height", filterHeight + "px");
}

$(function(){
	$("#runList .filter").draggable();
});

function buildCheckBoxes(numBoxes, runArray){
	console.log("Building " + numBoxes + " boxes.");
	console.log(runArray)
	$("#checkBoxes").remove();
	
	var container = $("<div id='checkBoxes'><ul>");
	var ul = $("<ul>");
	
	for(var i=0;i<numBoxes;i++){
		var checkbox = $("<li style='margin-top:" + runArray[i].x + "px'><input type='checkbox' name='c1' value='cc'>");
		var label = $('<label for="c1"><span></span></label>');
		$(ul).append(checkbox);
		$(checkbox).append(label);
	}
	
	
	$(container).append(ul);
	$("#treeContainer").append(container);
	
}

	
