AutoGraph.graphs.stacked_bar = {
	init:function(data){
		console.log(data)
		
		//Define a new plot
		var chart = new StackedBarChart(data);
		
		var id = Math.round(Math.random()*1000);
		var divContainer = $("<div id='container" + id + "'></div>")
		$("body").append(divContainer);
		chart.container = divContainer;
		chart.id = id;
		
		
		for(var item in chart.series){
				chart.loadCSV(chart.series[item]);
			}
		
		
		
		//Return the plot to be stored for later use/reference
		return chart;
	},
}
function StackedBarChart(data){
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
		this.disabledSeries = [];
		this.can_change = true;
		
	return this;
}

StackedBarChart.prototype.loadCSV = function(index, directory){
	var that = this;
	d3.tsv(index.directory + index.csvfilename, function(data){
		var parseDate = d3.time.format("%Y-%m").parse,
	    formatYear = d3.format("02d"),
	    formatDate = function(d) { return "Q" + ((d.getMonth() / 3 | 0) + 1) + formatYear(d.getFullYear() % 100); };

		data.forEach(function(d){
   		// d.date = parseDate(d.date);
		 d.value = +d.value;
		})
		that.data = data;
		
		that.initGraph();
		
		//console.log(data);	
	});
}


StackedBarChart.prototype.initGraph = function(){
	var that = this;
	var data = this.data;
	
	var parseDate = d3.time.format("%Y-%m").parse,
	    formatYear = d3.format("02d"),
	    formatDate = function(d) { return "Q" + ((d.getMonth() / 3 | 0) + 1) + formatYear(d.getFullYear() % 100); };

	
	var margin = {top:10, right:20, bottom:20, left:60},
		width = 400 - margin.left - margin.bottom,
		height = 500 - margin.top - margin.bottom;
		
	var y0 = d3.scale.ordinal()
		.rangeRoundBands([height, 0],.0001);
		
	var y1 = d3.scale.linear();
	
	var x = d3.scale.ordinal()
		.rangeRoundBands([100, width], .1, 0);
		
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		
	var nest = d3.nest()
		.key(function(d){return d.group;})
		
	var stack = d3.layout.stack()
		.values(function(d){return d.values})
		.x(function(d){return d.date})
		.y(function(d){return d.value})
		.out(function(d, y0){d.valueOffset = y0});
	
	var color = d3.scale.category10();
	
	var fullname = "#container" + this.id;

	console.log(this);
	
	var svg = d3.select(fullname).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var dataByGroup = nest.entries(data);
	console.log(dataByGroup)
	
	stack(dataByGroup);
	x.domain(dataByGroup[0].values.map(function(d){return d.date}));
	y0.domain(dataByGroup.map(function(d){return d.key}))
	y1.domain([0,d3.max(data, function(d){return d.value})]).range([y0.rangeBand(), 0]);
	
	var group = svg.selectAll('.group')
		.data(dataByGroup)
		.enter().append("g")
		.attr("class", "group")
		.attr("transform", function(d){return "translate(0," + y0(d.key) + ")"; })
	
	group.append("text")
		.attr("class", "group-label")
		.attr("x", -6)
		.attr("y", function(d){return y1(d.values[0].value/2); })
		.attr("dy", ".35em")
		.text(function(d){
			console.log(that.series[0].types[d.key - 1])
			return that.series[0].types[d.key - 1];
		})
		

	
	group.selectAll("rect")
		.data(function(d){return d.values})
		.enter().append("rect")
		.style("fill", function(d){return color(d.group)})
		.attr("x", function(d){return x(d.date)})
		.attr("y", function(d){return y1(d.value)})
		.attr("width", x.rangeBand())
		.attr("height", function(d){return y0.rangeBand() - y1(d.value)})

	console.log(group.selectAll("text"))
	
	//Selects each of the groups, adds values per value within the group
	group.selectAll(".group")
		.data(function(d){return d.values})
		.enter().append("text")
		.attr("class", "pcttext")
		.attr("x", function(d){return x(d.date)})
		.attr("y", function(d){return y1(d.value)})
		.text(function(d){
			console.log(d)
			return d.value + "%"
		})
		
		
			
	group.filter(function(d,i){return !i}).append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + y0.rangeBand() + ")")
		.call(xAxis);
		
	 var t = svg.transition().duration(750),
        g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
	    g.selectAll("rect").attr("y", function(d) { return y1(d.value); });
	    g.selectAll(".pcttext").attr("opacity", 1);
	    g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); })
	d3.selectAll("input").on("change", change);
	function change() {
	    if (this.value === "multiples") transitionMultiples();
	    else transitionStacked();
	  }

  function transitionMultiples() {
    var t = svg.transition().duration(750),
        g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
    g.selectAll("rect").attr("y", function(d) { return y1(d.value); });
    g.selectAll(".pcttext").attr("opacity", 1);
    g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); })
  }

  function transitionStacked() {
    var t = svg.transition().duration(750),
        g = t.selectAll(".group").attr("transform", "translate(0," + y0(y0.domain()[0]) + ")");
    g.selectAll("rect").attr("y", function(d) { return y1(d.value + d.valueOffset); });
    g.selectAll(".pcttext").attr("opacity", 0);
    g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2 + d.values[0].valueOffset); })
  }
	
	
	
}
