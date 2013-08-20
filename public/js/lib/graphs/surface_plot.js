function surfaceplot(config, div) {
	var surfacePlot;
			//var dsv = d3.dsv("|", "text/plain");
			
            // Check for the various File API support.
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported by your browser.');
            }
			
            function handleFileSelect(evt){
				console.log(evt)
				var loadingGif = document.getElementById("loading_image");
				
				if (loadingGif)
				    loadingGif.style.visibility = "visible";
				
				setTimeout(function() {
                
	                var files = evt.target.files;
	                var f = files[0];
	                
	                // Only process CSV files.
	                if (!f.type.match('text/csv')) {
	                    alert("Please specify a valid CSV file.");
	                    return;
	                }
	                
	                
	                
	                var reader = new FileReader();
	                
	                // Closure to capture the file information.
	                reader.onload = (function(theFile){
	                	console.log(theFile);
	                    return function(e){
	                    	
	                        var csvData = e.target.result;
	                        var data = formatDataForChart(csvData, false);
	                        renderChart(data);
	                    };
	                })(f);
	                
	                reader.readAsText(f);
	                console.log(f);
					
					if (loadingGif)
                    loadingGif.style.visibility = "hidden";
	                
	            }, 1000);
				
            }
            
            d3.text('data/lambda_winter_13x13.csv', function(data){
            	console.log(data)
            	 	data = formatDataForChart(data, false);
            		renderChart(data.zValues, data.xValues, data.yValues);
            	})
            
            //document.getElementById('filePicker').addEventListener('change', handleFileSelect, false);
            
         	function readfile (filename, use_include_path, context) {
				  // http://kevin.vanzonneveld.net
				  // +   original by: Brett Zamir (http://brett-zamir.me)
				  // -    depends on: echo
				  // *     example 1: readfile('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
				  // *     returns 1: '123'
				
				  var read_data = this.file_get_contents(filename, use_include_path, context); // bitwise-or use_include_path?
				  this.echo(read_data);
				  return read_data;
				}
				
			
            
            function formatDataForChart(allText, normalize){
            	
            	
            	
            	
            	
                var allTextLines = allText.split(/\r\n|\n|\r/);
                var line;
                var zValues = [];
				var data;
				var rows = allTextLines.length-1;
				var cols = 0;
				var zValue;
				var sum = 0;
                
                var xValues = []
                var yValues = []
                
                var l;
                var c;
                var d;
                
               // console.log(allTextLines[0][1].replace(/['"]/g,''));
                for(var q = 1;q<allTextLines.length-1;q++){
                	 l = allTextLines[q];
                    d = l.split(',');
                    d[0] =  d[0].replace(/['"]/g,'');
                    c = d.length;
                 // console.log(d)
                  yValues.push(d[0])
                 // xValues.push(l[0][q])
                }
                
                 for(var q = 0;q<allTextLines.length-1;q++){
                	 l = allTextLines[q];
                    d = l.split(',');
                    d[0] =  d[0].replace(/['"]/g,'');
                    c = d.length;
                  console.log(d)
                  if(q==0){
                  	for(var qq = 1;qq<d.length;qq++){
                  		console.log(d[qq]);
                  		d[qq] =  d[qq].replace(/['"]/g,'');
                  		xValues.push(d[qq])
                  		 
                  	}
                  }
                 // xValues.push(d[0])
                 // xValues.push(l[0][q])
                }
                
                console.log(yValues)
                console.log(xValues)
                
               // console.log(allText)
              //  console.log(allTextLines)
                
                for (var i = 0; i < rows; i++) {
                    line = allTextLines[i];
                    data = line.split(',');
                  //  console.log(data)
                    zValues[i] = [];
					cols = data.length-1;
					//console.log(cols);
					
					for (var j = 0; j <= cols; j++) {
						data[j] = data[j].replace(/['"]/g,'');
                        zValue = data[j] * 1.0;
				        zValues[i][j] = zValue;
						
						sum += zValue;
						
					}
                }
                
                console.log(zValues);
                zValues.splice(0,1)
				
				// If normalise is set to true then normalise the data by two standard deviations.
				if (normalize) {
					var mean = sum / (rows * cols);
					var sdev = 0;
					
					for (var i = 0; i < rows; i++) {
					
						for (var j = 0; j < cols; j++) {
						
							sdev += Math.pow(zValues[i][j] - mean, 2);
							
						}
						
					}
					
					sdev = Math.sqrt(sdev / (rows * cols));
					
					for (var i = 0; i < rows; i++) {
					
						for (var j = 0; j < cols; j++) {
						
							zValues[i][j] = (zValues[i][j] - mean) / (2 * sdev);
							
						}
						
					}
				}
				
				// If the number of rows and columns is too large then plot every nth value.
				var maxRowsCols = 110;
				var rowBucketSize = Math.max(Math.floor(rows/maxRowsCols), 1);
				var columnBucketSize = Math.max(Math.floor(cols/maxRowsCols), 1);
				var rowIndex = 0;
				var colIndex = 0;
				
				if (rowBucketSize > 1 || columnBucketSize > 1) {
					
					var smoothedData = [];
					
				    for (var i = 0; i < rows; i += rowBucketSize) {
						
						colIndex = 0;
						smoothedData[rowIndex] = [];
						
						for (var j = 0; j < cols; j += columnBucketSize) {
						
						  smoothedData[rowIndex][colIndex] = zValues[i][j];
						  colIndex++;
						  
						}
						
						rowIndex++;
                        
                    }	
					
					zValues = smoothedData;
					
				}
                
                return {
                	zValues:zValues,
                	xValues:xValues,
                	yValues:yValues
                }
            }
            
            function renderChart(zValues, xValues, yValues){
                
                
                for(var z = 0;z<zValues.length;z++){
                	zValues[z].shift()
                	
                }
                
                
                
                var xScale = d3.scale.linear()
                			.domain([d3.min(xValues, function(d){
                				return d;
                			}),d3.max(xValues, function(d){
                				return d;
                			})])
                			.range([300, 0]);
                			
               	var diff = xScale.domain()[1] - xScale.domain()[0]
               	console.log(xScale.domain()[1])
               	console.log(diff); 
               	console.log(diff/10)
               	var num = xScale.domain()[0];
               	var xAxis = [];
               	xAxis.push(Math.round(num * 100)/100);
               	for(var i = 0;i<10;i++){ //TODO:  10 = ticks
               		num += diff/10;
					xAxis.push(String(Math.round(num * 100)/100));    
					}           	
               	
               	
               	var yScale = d3.scale.linear()
                			.domain([d3.min(yValues, function(d){
                				return d;
                			}),d3.max(yValues, function(d){
                				return d;
                			})])
                			.range([300, 0]);
                			
               	diff = yScale.domain()[1] - yScale.domain()[0]
                num = yScale.domain()[0];
               	var yAxis = [];
               	yAxis.push(Math.round(num * 100)/100);
               	for(var i = 0;i<10;i++){ //TODO:  10 = ticks
               		num += diff/10;
               		yAxis.push(String(Math.round(num * 100)/100));
               	}
               	
               	console.log(xAxis);
               	
               	console.log(num)
                
                
                
                console.log(zValues)
                
                
                var numRows = zValues.length;
                var numCols = zValues[0].length;
                
                var values = new Array();
                var data = {
                    nRows: numRows,
                    nCols: numCols,
                    formattedValues: zValues
                };
                
				if (!surfacePlot)
                    surfacePlot = new SurfacePlot(document.getElementById("surfacePlotDiv"));
                
                var fillPly = true;
                
                // Define a colour gradient.
                var colour1 = {
                    red: 0,
                    green: 0,
                    blue: 255
                };
                var colour2 = {
                    red: 0,
                    green: 255,
                    blue: 255
                };
                var colour3 = {
                    red: 0,
                    green: 255,
                    blue: 0
                };
                var colour4 = {
                    red: 255,
                    green: 255,
                    blue: 0
                };
                var colour5 = {
                    red: 255,
                    green: 0,
                    blue: 0
                };
                var colours = [colour1, colour2, colour3, colour4, colour5];
                
                // Axis labels.
                var xAxisHeader = "Temperature";
                var yAxisHeader = "Flow";
                var zAxisHeader = "Growth Rate";
                
                var renderDataPoints = false;
                var background = '#ffffff';
                var axisForeColour = '#000000';
                var hideFloorPolygons = true;
                var chartOrigin = {
                    x: 150,
                    y: 150
                };
                
                // Options for the basic canvas plot.
                var basicPlotOptions = {
                    fillPolygons: fillPly,
                    renderPoints: renderDataPoints
                }
                
                // Options for the webGL plot.
                var xLabels = [];
               for(var l = 0;l<xValues.length-1;l++){
               	xLabels.push(Math.round(xValues[l] * 100)/100)
               }
               
               xLabels = xAxis;
                
                
                
                var yLabels = [];
                for(var l = 0;l<yValues.length-1;l++){
               	yLabels.push(Math.round(yValues[l] * 100)/100)
               }
               yLabels = yAxis;
               
                var zLabels = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]; // These labels are used when autoCalcZScale is false;
                var glOptions = {
                    xLabels: xLabels,
                    yLabels: yLabels,
                    zLabels: zLabels,
                    autoCalcZScale: true,
					animate: true
                };
                
                // Options common to both types of plot.
                var options = {
                    xPos: 0,
                    yPos: 0,
                    width: 800,
                    height: 800,
                    colourGradient: colours,
                    xTitle: xAxisHeader,
                    yTitle: yAxisHeader,
                    zTitle: zAxisHeader,
                    backColour: background,
                    axisTextColour: axisForeColour,
                    hideFlatMinPolygons: hideFloorPolygons,
                    origin: chartOrigin
                };
                
                surfacePlot.draw(data, options, basicPlotOptions, glOptions);
                
                // Link the two charts for rotation.
                var plot1 = surfacePlot.getChart();
            }
            
            return surfaceplot;
}


