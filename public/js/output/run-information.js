Output.runInformation = {
	
	
	parseResponse:function(response){
		//console.log(response + ": Object");
		//console.log(response);
		var jsonObject = JSON && JSON.parse(response) || $.parseJSON(response);
		//console.log(jsonObject);
		
		return jsonObject;
	},
	
	
	getRuns:function(w, h){
		
		console.log(Streams.app_control.apps.basin.basinId);
		var database_query = $.post('/runs-database', {basinId:Streams.app_control.apps.basin.basinId});
		var database_timer = setInterval(function(){
			if(database_query.readyState == 4){
				clearInterval(database_timer);
				console.log(database_query.responseText);
				var resp = Output.runInformation.parseResponse(database_query.responseText)
				if(resp.message == "NO RUN INFO"){
					 console.log("There was no run info available")
				}else {
					$("#treeContainer svg").remove();
					if(w || h){
					    Chart.init("#treeContainer", "/"+ Streams.user + "/data.json", w, h, 55, 70, 147, 80, 25, "output", true);
					} else {
					 	Chart.init("#treeContainer", "/"+ Streams.user + "/data.json", 1900, $(window).height()/1.2, 105, 60, 190, 110, 45, "output", true);
					}
					
					//$("#treeContainer").animate({ 'zoom': (window.innerHeight/h) }, 400);

				}

				//Output.runInformation.buildJSONTree(database_query.responseText);
			}
		},1000)
	},
	
	buildJSONTree:function(response){
		/*
		console.log(response);
		var run_information = Output.runInformation.parseResponse(response);
		console.log(run_information.users)
		if(run_information.users == undefined){
			Output.runInformation.debugChart();
			return;
		}
		var run_list = run_information.user.runs;
		var tree = new Object();
		tree.children = new Array();
		tree.alias = "basin";
		for(var c = 0;c < run_list.length;c++){
			run_list[c].children = new Array();
		}
		
		function findChildren(p){
           	console.log("Looking for objects with parent of " + p.stepID)
           	for(var i=0;i<run_list.length;i++){
           		if(run_list[i].parent == p.stepID){
           			console.log("I found a match!" + run_list[i].stepID);
           			console.log("Adding it to the parent...")
           			p.children.push(run_list[i])
           			findChildren(run_list[i])
           		}
           	}
           }
        	
        findChildren(run_list[0]);
        
        for(var x = 0; x < run_list.length;x++){
        	if(run_list[x].parent == "basin"){
        		tree.children.push(run_list[x]);
        	}
        }
        
        console.log("RECEIVED THE TREE")
        console.log(tree);
        tree = JSON.stringify(tree);
        console.log(tree);
		Chart.init("#treeContainer", tree, 1100, 455, 55, 70, 147, 80, 25, "output", false);
		*/
	},
	
	debugChart:function(){
  		Chart.init("#treeContainer", "../json/data2.json", 1100, 455, 55, 70, 147, 80, 25, "output", true);
	}
	
	
	
}
