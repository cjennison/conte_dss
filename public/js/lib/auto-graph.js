var AutoGraph = {
	graphs:{},
	activeGraphs:[],
	
	initialize:function(info, isURL, divs ){
		
		if(divs == null){
			divs = [null,null];
		}
		
		
		//If the info is a URL, find the JSON file configuration
		if(isURL){
			var config = d3.json(info, function(data){
				console.log(data);
				AutoGraph.parseGraphs(data, divs);
			})
		} else {
			AutoGraph.parseGraphs(info, divs);
		}
		
	},
	
	parseGraphs:function(data, divs){
		var graphTypes = data.graphTypes;
		for(graph in graphTypes){
			//console.log(graphClass);
			console.log(graphTypes[graph].graphClass);
			
			var newgraph;
			console.log(AutoGraph.graphs);
			if(graphTypes[graph].graphClass == "surface_plot"){
			 newgraph = surfaceplot(graphTypes[graph], divs[graph]);
			} else {
			 newgraph = AutoGraph.graphs[graphTypes[graph].graphClass].init(graphTypes[graph], divs[graph]);
			}
			AutoGraph.activeGraphs.push(newgraph);
		}
		
		console.log(AutoGraph.activeGraphs)
	},
	
}
