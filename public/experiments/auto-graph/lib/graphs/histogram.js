AutoGraph.graphs.histogram = {
	init:function(data){
		console.log(data)
		
		//Define a new plot
		var chart = new Histogram(data);
		
		var id = Math.round(Math.random()*1000);
		var divContainer = $("<div id='container" + id + "'></div>")
		$("body").append(divContainer);
		
		var form = $('<form> <label><input type="radio" name="mode" value="stacked" checked> Stacked</label></form>')
		$(divContainer).append(form);
		chart.container = divContainer;
		chart.id = id;
		
		
		for(var item in chart.series){
				chart.loadCSV(chart.series[item]);
			}
		
		console.log(chart);		
		//Return the plot to be stored for later use/reference
		return chart;
	},
}
function Histogram(data){
		console.log(data)
		this.graphType = data.graphType;
		this.series = data.series;
		this.title = data.title;
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
		this.xPool = [];
		
	return this;
}

Histogram.prototype.loadCSV = function(index, directory){
	var that = this;
	d3.csv(index.directory + index.csvfilename, function(data){
		index.data = data;
		
		
		index.self_data = [];
		for(var i=0;i<data.length;i++){
			var obj = {};
			obj.x = data[i][index.xcolumn];
			obj.y = Number(data[i][index.ycolumn]);
			if(obj.x < 40 || obj.x > 270){
				
			} else{
				index.self_data.push(obj);
			}
			
			
			
		}
		
		index.enabled = true;
		index.complete = true;
		console.log(index);
		
		var completed_data = 0;
		for(var q = 0;q < that.series.length;q++){
			if(that.series[q].complete){
				completed_data++;
			}
			if(completed_data >= that.series.length){
				that.initGraph(function(){
					
				})
			}
		}
		
		
	})
}

Histogram.prototype.initGraph = function(cb){
	console.log("Intitializing Chart")
	var that = this;
	 this.totalData = [];
	var dataset = [];
	for(var i = 0 ; i < this.series.length; i++){
		console.log(this.series[i].self_data)
		dataset.push(this.series[i].self_data);
		for(var p = 0;p < this.series[i].self_data.length;p++){
			this.totalData.push(this.series[i].self_data[p]);
		}
	}
	
	var minima;
	for(var i=0;i<this.totalData.length;i++){
		if(this.totalData[i].y >.001){
			minima = this.totalData[i].x * .8;
			break;
		}
	}
	
	console.log("MINIMA " + minima);
	
	var maxima;
	for(var i=this.totalData.length-1;i>0;i--){
		if(this.totalData[i].y >.001){
			maxima = this.totalData[i].x * 1.2;
			break;
		}
	}
	
	console.log("MINIMA " + minima);
	
	
	
	//console.log(totalData)
	
	var n = 3, //number of layers
		m = 350,
		stack = d3.layout.stack();
		
	var somevar = .08; //.08 def
		
	//var layers = stack(d3.range(n).map(function() { return bumpLayer(m, .1)}))
	
	//console.log(stack(d3.range(n).map(function(){return this.series[n].self_data})))
	var layers = stack(dataset);
		console.log(layers);
	var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d){return d.y;})})
    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
	
	//yGroupMax = .1;
	
	var margin = {top:40, right:10, bottom:20, left:30},
		width  = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
		
	var x = d3.scale.ordinal()
			.domain(d3.range(layers[0].length))
			.rangeRoundBands([0, width], somevar)
	
	console.log(this.totalData);
	
	var xLinear = d3.scale.linear()
					.domain([maxima, minima])
					.range([width, 0]);
	
			
	console.log(xLinear.domain)
			
	var y = d3.scale.linear()
			.domain([0, yStackMax])
			//.interpolate(d3.interpolateRgb)
			.range([height, 0])
			
	var color = d3.scale.linear()
				.domain([0, n - 1])
				.range(['#aad', '#556']);
				
	var yAxis = d3.svg.axis()
				.scale(y)
				.tickSize(0)
				.tickPadding(6)
				.orient("left");
	
	var xAxis = d3.svg.axis()
				.scale(x)
			    //.tickSize(0)
			    //.tickPadding(6)
			    .ticks(1)
			    .orient("bottom");
			    
	var xAxisLinear = d3.svg.axis()
				.scale(xLinear)
			    //.tickSize(0)
			    //.tickPadding(6)
			    .ticks(20)
			    .orient("bottom");
			    
	var fullname = "#container" + this.id;
			    	
	var svg = d3.select(fullname).append("svg")
			.datum(that.totalData)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	var layer = svg.selectAll(".layer")
		.data(layers)
		.enter()
		.append("g")
		.attr("class", "layer")
		.style("fill", function(d, i){
			return color(i)
		})
		
	var rect = layer.selectAll("rect")
		.data(function(d){return d})
		.enter()
		.append("rect")
		.attr("data", function(d){
			return d.x + ", " + d.y;
		})
		 .attr("x", function(d) { return xLinear(d.x) + margin.left/2 })
		.attr("y", height)
		.attr("width", x.rangeBand())
		.attr("height", 0);
	
	var line = d3.svg.line()
	    .interpolate("basis-open") // custom interpolator
	    .x(function(d) { return x(d.x); })
	    .y(function(d) { return y(d.y); })
	
	/*    
	svg.append("path")
		.attr("class", "line")
		.attr("stroke", "black")
		.attr("fill", "rgba(255,255,255,0)")
		.attr("stroke-width", "2px")
		.attr("d", line)
		.attr("transform", "translate(" + -margin.left + ", 0)")
		*/
		
	//Stacked
	function stacked(){
		y.domain([0, yStackMax]);
		
		yAxis = d3.svg.axis()
				.scale(y)
				.tickSize(0)
				.tickPadding(6)
				.orient("left");
		
		yaxis.call(yAxis);
	  rect.transition()
	      .duration(500)
	      .delay(function(d, i) { return i * 10; })
	      .attr("y", function(d) { return y(d.y0 + d.y); })
	      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	    .transition()
	      .attr("x", function(d) { return xLinear(d.x) + margin.left/2 })
	      .attr("width", x.rangeBand());
		
	}
	
	//Groups
	function grouped(){
		y.domain([0, yGroupMax]);
		
		rect.transition()
			.duration(500)
			.delay(function(d, i){return i * 10})
			.attr("x", function(d, i, j){
				return (x(d.x) + x.rangeBand() / n * j) - margin.left
			})
			.attr("width", x.rangeBand() / n)
			.transition()
				.attr("y", function(d){
					return y(d.y)
				})
				.attr("height", function(d){
					return height - y(d.y);
				})
			
	}
	
	
	
	
	
	d3.selectAll("input").on("change", change);
	function change(){
		if(this.value === "grouped") grouped();
		else stacked();
	}
	
	//Add Axes	
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + (margin.left - 10) + "," + height + ")")
		.call(xAxisLinear);
		
	var yaxis = svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (margin.left - 10) + ",0)")
		.call(yAxis)
		.selectAll("line")
		.attr("x2", this.w)
		
	var con = $(fullname);
	var xLabel = $("<div class='xlabel'>" + that.xLabel + "</div>")
	$(xLabel).css("bottom", '0px')
	
	
	var yLabel = $("<div class='ylabel'>" + that.yLabel + "</div>")
	$(xLabel).css("width", this.w);
	$(yLabel).css("width", this.w);
	$(yLabel).css("left", (this.h - this.padding) * -1)
	$(yLabel).css("bottom", (this.h/2 + this.padding))
	
	
	var title = $("<div class='title'>" + that.title + "</div>")
	$(title).css("width", this.w);
	$(title).css("top", ((this.h  + this.padding) * -1))
	
	
	$(con).append(xLabel);
	$(con).append(yLabel);
	$(con).append(title);
	stacked();

}


// Inspired by Lee Byron's test data generator.
function bumpLayer(n, o) {

  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }

  var a = [], i;
  for (i = 0; i < n; ++i) a[i] = o + o * Math.random();
  for (i = 0; i < 5; ++i) bump(a);
  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}







