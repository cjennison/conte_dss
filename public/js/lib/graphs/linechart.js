AutoGraph.graphs.linechart = {
	
	init:function(data, div){
		console.log(data)
		
		//Define a new plot
		var plot = new Lineplot(data);
		
		
		
		
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

function Lineplot(data){
		console.log(data)
		this.graphType = data.graphType;
		this.series = data.series;
		this.title = data.title;
		this.titlesize = data.title_size;
		this.xLabel = data.xlab;
		this.yLabel = data.ylab;
		this.xTicks = data.xtick_interval;
		this.yTicks = data.ytick_interval;
		this.fontsize = data.label_size;
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
		this.xPool = [];
		this.disabledSeries = [];
		this.can_change = true;
		this.popup = null;
		
	return this;
}

Lineplot.prototype.loadCSV = function(index, directory){
	var that = this;
	d3.csv(index.directory + index.csvfilename, function(data){
		index.data = data;
		index.enabled = true;
		index.complete = true;
		index.xPool = [];
		index.yPool = [];
		console.log(index)
		console.log(data)
		
		for(var x = 0;x < data.length; x++){
			that.dataset.push(data[x]);
			that.yPool.push(data[x][index.ycolumn]);
			that.xPool.push(data[x][index.xcolumn]);
		}
		
		console.log(that)
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

Lineplot.prototype.initGraph = function(cb){
	var that = this;
	this.xScale = d3.scale.linear()
					.domain([d3.min(this.xPool, function(d){return Number(d)}), d3.max(this.xPool, function(d){return Number(d) })])
					.range([this.padding, this.w - this.padding * 2.2]);
	this.yScale = d3.scale.log()
					.domain([d3.min(this.yPool, function(d){return Number(d)}), d3.max(this.yPool, function(d){return Number(d) })])
					.range([this.h - this.padding, this.padding])
					
	var fullname = "#container" + this.id;
    if(this.fixedDiv){fullname = this.fixedDiv}
    
    console.log(this);
    var numberFormat = d3.format(",f");
	  function logFormat(d) {
	    var x = Math.log(d) / Math.log(10) + 1e-6;
	    return Math.abs(x - Math.floor(x)) < .7 ? numberFormat(d) : "";
	  }
	  
	  this.tooltip = d3.select(fullname)
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.text("a simple tooltip");
	  
   //Add Axes
	 this.xAxis = d3.svg.axis();
		 this.xAxis.scale(this.xScale);
		 this.xAxis.orient("bottom");
		 this.xAxis.ticks(this.xTicks);
		// this.xAxis.tickFormat(logFormat);
		 
	console.log(this.xAxis)
		
	this.yAxis = d3.svg.axis();
		 this.yAxis.scale(this.yScale);
		 this.yAxis.orient("left");
		 this.yAxis.ticks(this.yTicks);
		 this.yAxis.tickFormat(logFormat);
    
    this.svg = d3.select(fullname)
    	.append("svg:svg")
    	.attr("width", this.w)
    	.attr("height", this.h)
    	
   this.svgXAxis = this.svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + (this.h-this.padding) + ")")
		.call(this.xAxis);
		
	this.svgYAxis = this.svg.append("g")
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
    
   cb();
}


Lineplot.prototype.addPoints = function(series){
	var that = this;
	console.log(series)
	series.complete = false;
	
	//No Points
	if(series.empirical == true){
		
	}
	
	else {
		this.svg.append('g')
		.attr("class", "points")
		.selectAll(".point")
			.data(series.data)
			.enter()
			.append("path")
			.attr("class", "point")
			.attr("id", function(){
				var str = series.serieslab;
				str = str.replace(/\s+/g, '');
				return str;
			})
			.attr('data', function(d){
				return d[series.xcolumn] + ", " + d[series.ycolumn];
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
			.attr('transform', function(d){
				return "translate(" + that.xScale(Number(d[series.xcolumn])) + ", " + that.yScale(Number(d[series.ycolumn])) + ")"
			})
	}
	
	
	
	
			
	
		
			console.log("We got a little one")
		
		
			var line = d3.svg.line()
			 .interpolate("basis")
				.x(function(d){
					return that.xScale(d[series.xcolumn]);
				})
				.y(function(d){
					return that.yScale(d[series.ycolumn]);
				})
				
			var path = this.svg.append("svg:path")
					.data(series.data)
					.attr("d", line(series.data))
					.attr("stroke", function(d){
						if(series.stroke == null){
							return series.color;
						}
						return series.stroke;
					})
					.attr("stroke-width", "2px")
					.attr("fill", "none")
		
			if(series.linetype){
				path.attr(series.linetype, ("9, 9"))
			}
		
		
	
}









