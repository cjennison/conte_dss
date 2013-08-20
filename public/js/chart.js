var Chart = {
	
	tree:null,
	
	
	//Initialize Graph
	init:function(object, dataJson, width, height, xPos, yPos, nodeLength, xSpread, textSize, type, is_url){
		var m = [xSpread, 190, xSpread, 190],
		    w = width - m[1] - m[3],
		    h = height - m[0] - m[2],
		    i = 0,
		    root;
		
		var tree = d3.layout.tree()
		    .size([h, w]);
		
		var diagonal = d3.svg.diagonal()
		    .projection(function(d) { return [d.y, d.x]; });
		
		var vis = d3.select(object).append("svg:svg")
		    .attr("width", "100%")
		    .attr("height", h + m[0] + m[2])
		 	.append("svg:g")
		    .attr("transform", "translate(" + xPos + "," + yPos + ")");
		    
		this.tree = $("#tree");
		
		if(!is_url){
			root = dataJson;
			  root.x0 = h / 2;
			  root.y0 = w / 2;
			  console.log(root);
			  
			
			  function toggleAll(d) {
			    if (d.children) {
			      d.children.forEach(toggleAll);
			      toggle(d);
			    }
			  }
			
			  // Initialize the display to show a few nodes.
			  root.children.forEach(toggleAll);
			  toggle(root.children[0]);
			  update(root);
		} else {
			d3.json(dataJson, function(json) {
			  root = json;
			  root.x0 = h / 2;
			  root.y0 = w / 2;
			  
			
			  function toggleAll(d) {
			    if (d.children) {
			      d.children.forEach(toggleAll);
			      toggle(d);
			     }
			  }
			
			  // Initialize the display to show a few nodes.
			  root.children.forEach(toggleAll);
			  toggle(root.children[0]);
			 // toggle(root.children[0].children[0]);
			 // toggle(root.children[0].children[0].children[0]);
			  findSkippedChildren(root);
			  update(root);
			});
		}
		
		function findSkippedChildren(p){
			console.log(p);
			if(p.children){
				for(var i = 0;i < p.children.length;i++){
					if(p.children[i].skipped == "true"){
						toggle(p.children[i]);
					}
					if(p.children[i].children){
						findSkippedChildren(p.children[i]);
					}
				}
			}
		}

		
		
		function update(source) {
		
		 
		  var duration = d3.event && d3.event.altKey ? 5000 : 500;
		
		  // Compute the new tree layout.
		  var nodes = tree.nodes(root).reverse();
		
		  // Normalize for fixed-depth.
		  nodes.forEach(function(d) { d.y = d.depth * nodeLength; d.toggled = false });
		
		  // Update the nodes…
		  var node = vis.selectAll("g.node")
		      .data(nodes, function(d) { return d.id || (d.id = ++i); });
		
		  // Enter any new nodes at the parent's previous position.
		  var nodeEnter = node.enter().append("svg:g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		      .on("click", function(d) { 
				if(d.skipped == "true"){return;}
				toggle(d); 
				update(d); 
			});
		
		  nodeEnter.append("svg:circle")
		      .attr("r", 1e-6)
		      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
		
		  nodeEnter.append("svg:text")
		      .attr("x", -8)
		      .attr("dy", textSize + "px")
		      .attr("text-anchor",  "start")
		      .text(function(d) { 
				if(d.skipped == "true"){return "";}
				return d.alias; 
			})
		      .style("fill-opacity", 1e-6);
		
		  // Transition nodes to their new position.
		  var nodeUpdate = node.transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
		
		  nodeUpdate.select("circle")
		      .attr("r", 8.5)
		      .style("fill", function(d) { 
				//console.log(d);
				
				return d._children ? "lightsteelblue" : "#fff"; 
			})
			.attr("opacity", function(d){
				if(d.skipped == "true"){
					return "0";
				} else {
					return 1;
				}
			});
		
		  nodeUpdate.select("text")
		      .style("fill-opacity", 1);
		
		  // Transition exiting nodes to the parent's new position.
		  var nodeExit = node.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		      .remove();
		
		  nodeExit.select("circle")
		      .attr("r", 1e-6);
		
		  nodeExit.select("text")
		      .style("fill-opacity", 1e-6);
		
		  // Update the links…
		  var link = vis.selectAll("path.link")
		      .data(tree.links(nodes), function(d) { return d.target.id; });
		
		  // Enter any new links at the parent's previous position.
		  link.enter().insert("svg:path", "g")
		      .attr("class", "link")
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return diagonal({source: o, target: o});
		      })
		    .transition()
		      .duration(duration)
		      .attr("d", diagonal);
		
		  // Transition links to their new position.
		  link.transition()
		      .duration(duration)
		      .attr("d", diagonal);
		
		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(duration)
		      .attr("d", function(d) {
		        var o = {x: source.x, y: source.y};
		        return diagonal({source: o, target: o});
		      })
		      .remove();
			
			
			
		  var id = source.id;
		  
		  var children = source.children;
		  var siblings;
		  if(source.parent){
		  	siblings = source.parent.children;
		  }
		  
		  
		  var numNodes = 0;
		  var runArray = [];
		  var totalRunArray = [];
		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		   // console.log("NODES.FOREACH");
		   // console.log(d);
			
					    
		    if(!d.toggled){
		    	totalRunArray.push(d);
		    	if(!d.children){
		    		numNodes++;
		    		runArray.push(d);
		    	}
		    } 
		    
		    //console.log(d);
		  });
		  
		  if(type == "output"){
		  	//buildCheckBoxes(numNodes, runArray);
		  	//buildGraphBoxes(totalRunArray);
		  }
		 
		}
		
		// Toggle children.
		function toggle(d) {
		  if (d.children) {
			if(d.skipped != "true"){
				d.toggled = false;
			} else {
				console.log("stop right there criminal");
			}
		  	
					  	//console.log("TOGGLING OFF")
		    d._children = d.children;
		    d.children = null;
			
			
		  } else {
		  	//console.log("TOGGLING ON");
		  	if(d.skipped != "true"){
				d.toggled = true;
			} else {
				console.log("stop right there criminal");
			}

		    d.children = d._children;
		    d._children = null;
			if(d.children){
				for(var i = 0;i < d.children.length;i++){
					
					if(d.children[i]._children){
						console.log(d.children[i]);
						if(d.children[i].toggled == false){						
							toggle(d.children[i]);
							d.children[i].toggled = true;
						}
					}
				}
			}
			
		  }
		  //console.log(d);
		}
	},
	
	
	
	addThumbnail:function(img){
		var thumbnail = img;
		this.tree.append('<img src=' + thumbnail + '/>');
	}
}
