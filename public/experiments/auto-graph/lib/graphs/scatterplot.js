AutoGraph.graphs.scatterplot = {
	
	init:function(data, div){
		console.log(data)
		
		//Define a new plot
		var plot = new Scatterplot(data);
		
		
		
		
		var id = Math.round(Math.random()*1000);
		var divContainer = $("<div id='container" + id + "'></div>")
		$("body").append(divContainer);
		plot.container = divContainer;
		plot.id = id;
		
		console.log(div)
		if(div){
			plot.fixedDiv = div;
		}
		
		
		for(var item in plot.series){
				plot.loadCSV(plot.series[item]);
			}
		
		
		
		//Return the plot to be stored for later use/reference
		return plot;
	},
	
}

function Scatterplot(data){
		console.log(data)
		this.graphType = data.graphType;
		this.series = data.series;
		this.title = data.title;
		this.fontsize = data.label_size;
		this.titlesize = data.title_size;
		this.xLabel = data.xlab;
		this.yLabel = data.ylab;
		this.xTicks = data.xtick_interval;
		this.yTicks = data.ytick_interval;
		this.ycolumn_min = data.ycolumn_min;
		this.ycolumn_max = data.ycolumn_max;
		this.w = data.width;
		this.h = data.height;
		this.padding = data.padding;
		this.xScale = null;
		this.yScale = null;
		this.svg = null;
		this.dataset = [];
		this.yPool = [];
		this.disabledSeries = [];
		this.can_change = true;
		
	return this;
}

Scatterplot.prototype.loadCSV = function(index, directory){
	var that = this;
	d3.csv(index.directory + index.csvfilename, function(data){
			console.log(data);
			//Individual Series Data
			index.data = data;
			index.enabled = true;
			
			index.complete = true;
			console.log(index)
			//Plot Data
			for(var x=0;x<data.length;x++){
				that.dataset.push(data[x]);
				that.yPool.push(data[x][index.ycolumn])
			}
			
			console.log(that.yPool)
			
			var completed_data = 0;
			for(var i = 0;i<that.series.length;i++){
				if(that.series[i].complete){
					completed_data++;
				}
				if(completed_data >= that.series.length){
					console.log("All Data Has Been Loaded")
					that.initGraph(function(){
						for(var set in that.series){
							that.addPoints(that.series[set], function(){
								
							})
						}
					});
				}
			}
			
		})
}

Scatterplot.prototype.addPoints = function(series, db){
	var that = this;
	series.complete = false;
	console.log(series);
	this.svg.append('g')
		.attr("class", "points")
		.selectAll(".point")
			.data(series.data)
			.enter()
			.append("path") //Change shape here
			.attr("class", "point")
			.attr('id', function(){
				//series.serieslab)
				var str = series.serieslab;
				str = str.replace(/\s+/g, '');
				return str;
			})
			.attr('data', function(d){
				return d["year"] + ", " + d[series.ycolumn];
			})
			.attr("d", d3.svg.symbol().type(series.symbol).size(series.symbolsize))
			.attr("series", series.serieslab)
			.attr("stroke", function(d){
				if(series.stroke == null){
					return series.color;
				}
				return series.stroke;
			})
			.attr('fill', function(d){
				if(series.color == null){
					return "white";
				}
				return series.color;
			})
      		.attr("transform", function(d) { return "translate(" + that.xScale(Number(d["year"])) + "," + that.yScale(Number(d[series.ycolumn])) + ")" })
			
			/*
			.attr({
				cx: function(d){
					var num = Number(d["year"]);
					
					return that.xScale(num);
				},
				cy: function(d){
					var num = (Number(d[series.ycolumn]))
					return that.yScale(num);
				}/*,
				r: function(d){
					return series.symbolsize;
				},
				fill:series.color 
			})*/
			/*
			.on('mouseover', function(d){
				d3.select(this)
					.transition()
					.attr("r", series.symbolsize + 5)
			})
			.on('mouseout', function(d){
				d3.select(this)
					.transition()
					.attr("r", series.symbolsize)
			})
			*/
			
	this.addToToggle(series.serieslab, series);

}

Scatterplot.prototype.addToToggle = function(label, series){
	var that = this;
	var selector = "#container" + this.id;
	if(this.fixedDiv){
		selector = this.fixedDiv;
	}
	var toggle = $(selector).find(".toggle ul");
	var li = $("<li></li>");
	var span = $("<span class='ser-label'> " + label + "</span>")
	
	var color = series.color;
	if(series.color == null){
		color = series.stroke;
	}
	
	
	var canvas = $("<canvas width='25' height='25'>")
	console.log(that.can_change);
	
	if(series.symbol == 'circle'){
		$(canvas).drawEllipse({
		layer:true,
		  fillStyle:color,
		  strokeStyle:color,
 		 strokeWidth: 2,
		  x: 6, y: 6,
		  width: 10, height: 10,
		 click: function(layer) {
				    if(layer.fillStyle != "rgb(255,255,255)"){
				    	 $(this).animateLayer(layer, {
					      fillStyle: 'rgb(255,255,255)'
					    });
					    that.togglePoints(label, "OFF")
				    } else {
				    	 $(this).animateLayer(layer, {
					      fillStyle: color
					    });
					    that.togglePoints(label, "ON")
			    } 
			  }
		});
	}
	if(series.symbol == 'diamond'){
		$(canvas).drawPolygon({
			layer:true,
			fillStyle:color,
			x:6, y:6,
			strokeStyle:color,
 			strokeWidth: 2,
 			radius: 5,
 			sides:4,
 			rotate:45,
 			click: function(layer) {
				    if(layer.fillStyle != "rgb(255,255,255)"){
				    	 $(this).animateLayer(layer, {
					      fillStyle: 'rgb(255,255,255)'
					    });
					    that.togglePoints(label, "OFF")
				    } else {
				    	 $(this).animateLayer(layer, {
					      fillStyle: color
					    });
					    that.togglePoints(label, "ON")
			    } 
			  }
		})
	}
	
	
	
	$(li).append(canvas);
	$(li).append(span);
	
	$(toggle).append(li);
}

Scatterplot.prototype.togglePoints = function(series, state){
	var circles = $('path');	
	
	for(var z = 0;z < this.series.length;z++){
		if(this.series[z].serieslab == series){
			if(state == "OFF"){
				this.series[z].enabled = false;
			} else {
				this.series[z].enabled = true;			
			}
		}
	}
	
	
	
	
	for(var i = 0;i<circles.length;i++){
		
		if($(circles[i]).attr("series") == series){
			if(state == "OFF"){
				$(circles[i]).css("opacity", 0)
				
			} else {
				$(circles[i]).css("opacity", 1)
			}
			$(circles[i]).attr("state", state);
		}
		//console.log(i + ", " + circles.length);
		if(i >= circles.length - 1){
			this.evalScale();
			this.can_change == true;
		}
	}
	
}


Scatterplot.prototype.evalScale = function(series){
	console.log(this.series)
	var newPool = [];
	var xPool = [];
	var that = this;
	
	for(var q = 0;q<this.series.length;q++){
		if(this.series[q].enabled == true){
			for(var qq = 0;qq<this.series[q].data.length;qq++){
				xPool.push(this.series[q].data[qq]['year'])
				newPool.push(this.series[q].data[qq][this.series[q].ycolumn])
			}
		}
		
	}
	
	
	//console.log(newPool);
	that.xScale.domain([d3.min(xPool, function(d){return Number(d)}), d3.max(xPool, function(d){return Number(d) })])
	that.yScale.domain([d3.min(newPool, function(d){return Number(d)}), d3.max(newPool, function(d){return Number(d) })])
	that.svg.select(".y.axis")
		.transition()
		.duration(1000)
		.call(that.yAxis)
		.selectAll("line")
		.attr("x2", this.w - this.padding * 3);
		
	that.svg.select(".x.axis")
		.transition()
		.duration(1000)
		.call(that.xAxis);
		
	console.log(this);
	
	if(xPool.length == 0){return;}
	
	for(var x in that.series){
		var all = that.svg.selectAll("#" + that.series[x].serieslab);
		var str = that.series[x].serieslab;
				str = str.replace(/\s+/g, '');
		
		that.svg.selectAll("#" + str)
			.data(that.series[x].data)
			.transition()
			.duration(1000)
			.attr("transform", function(d) { return "translate(" + that.xScale(Number(d["year"])) + "," + that.yScale(Number(d[that.series[x].ycolumn])) + ")"; });

			/*
			.attr({
				cx: function(d){
					var num = Number(d["year"]);

					return that.xScale(num);
				},
				cy: function(d){
					var num = (Number(d[that.series[x].ycolumn]))
					return that.yScale(num);
				}
				
			})
			*/
			
	}
}


Scatterplot.prototype.initSeriesToggle = function(){	
	var selector = "#container" + this.id;
	if(this.fixedDiv){
		selector = this.fixedDiv;
	}
	var toggle = $("<div class='toggle'><ul></ul></div>")
	$(toggle).css("left", this.w - this.padding * 2.2)
	$(toggle).css("top", -this.h + (this.padding))
	$(selector).append(toggle)
}

Scatterplot.prototype.initGraph = function(cb){
	
	var that = this;
	console.log(this);
	
	this.minY = (d3.min(this.yPool, function(d){return Number(d)})) * 1.0;
	this.maxY = d3.max(this.yPool, function(d){return Number(d)}) * 1.0;
	this.minX = (d3.min(this.dataset, function(d){return Number(d['year'])})) * 1;
	this.maxX = (d3.max(this.dataset, function(d){return Number(d['year'])})) * 1;
	
	this.xScale = d3.scale.linear()
					.domain([this.minX, this.maxX])
					.range([this.padding, this.w - this.padding * 2.2]);
	this.yScale = d3.scale.linear()
					.domain([this.minY, this.maxY])
					.range([this.h - this.padding, this.padding])
console.log("MIN");
console.log(d3.min(this.yPool, function(d){return Number(d)}))				

   var fullname = "#container" + this.id;
   if(this.fixedDiv){fullname = this.fixedDiv}
	
	//Add Axes
	 this.xAxis = d3.svg.axis();
		 this.xAxis.scale(this.xScale);
		 this.xAxis.orient("bottom");
		 this.xAxis.ticks(this.xTicks);
		 this.xAxis.tickFormat(d3.format("04d"));
		
	this.yAxis = d3.svg.axis();
		 this.yAxis.scale(this.yScale);
		 this.yAxis.orient("left");
		 this.yAxis.ticks(this.yTicks);
		
	this.svg = d3.select(fullname)
		.append("svg")
		.attr("width", this.w)
		.attr("height", this.h);
	
	this.svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + (this.h-this.padding) + ")")
		.call(this.xAxis);
		
	this.svgAxis = this.svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (this.padding) +" , 0)")
		.call(this.yAxis)
		.selectAll("line")
		.attr("x2", this.w - this.padding * 3)
	
	
	var con = $(fullname);
	var xLabel = $("<div class='xlabel'>" + that.xLabel + "</div>")
	$(xLabel).css('font-size', this.fontsize);
	
	
	var yLabel = $("<div class='ylabel'>" + that.yLabel + "</div>")
	$(xLabel).css("width", this.w);
	$(yLabel).css("width", this.w);
	$(yLabel).css("left", (this.h - this.padding) * -1)
	$(yLabel).css("bottom", (this.h/2 + this.padding))
	$(yLabel).css('font-size', this.fontsize);
	
	var title = $("<div class='title'>" + that.title + "</div>")
	$(title).css("width", this.w);
	$(title).css("top", ((this.h  + this.padding/2) * -1))
	$(title).css('font-size', this.titlesize);
	
	$(con).append(xLabel);
	$(con).append(yLabel);
	$(con).append(title);
	
		 
	this.initSeriesToggle();
	cb();
}












