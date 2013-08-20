var graphObject = []
var inputGraph = (function () {

	/**
	 * @param {Object} graph
	 * @param {Object} html
	 * @param {Object} container
	 * @param {Object} kinContainer
	 * @param {Object} type
	 * @param {Object} min
	 * @param {Object} max
	 */
    function initGraph(name, container, kinContainer, type, html, min, max, xLabel, yLabel) {
        var newgraph = {};
        newgraph.name = name;
        
        createGraph(newgraph, $(html), $(container), kinContainer, type, min, max, xLabel, yLabel, name);

        graphObject.push(newgraph);

        
       setInterval(function(){
	       	if(Streams.yearRange == null){return}
	       	updateDate(Streams.yearRange);
       },100)

    }
    
    
    
    
    function updateDate(date){
    	//console.log(date);
    	var d = new Date();
    	if(date == NaN){date = 0}
    	//console.log(date)
    	for(var i=0;i<graphObject.length;i++){
    		//console.log(graphObject[i].xAxisNumber.textArr[0]);
    		graphObject[i].xAxisNumber.textArr[0] = "                              "+ d.getFullYear() +"                                                                                    " + (d.getFullYear() + date);
    		graphObject[i].stage.draw();
    	}   	
    }
    
	/**
	 * 
	 * @param {Object} graph
	 * @param {Object} html
	 * @param {Object} container
	 * @param {Object} kinContainer
	 * @param {Object} type
	 * @param {Object} min
	 * @param {Object} max
	 */
    function createGraph(graph, html, container, kinContainer, type, min, max, xLabel, yLabel, name) {
        graph.container = container;
        graph.type = type;
		graph.difference_left = 3;
		graph.difference_right = 9;
        var stage = new Kinetic.Stage({
            container: kinContainer,
            width: 398,
            height: 100
        });
        
        $(container).append(html);

        graph.stage = stage;

        //Define the working layer
        var layer = new Kinetic.Layer();

        //Left Node
        handle = new Image();
        handle.src = "images/arrowsHandle.png";
        
        varHandle = new Image();
        varHandle.src = "images/variance_handle.png";
        
        var leftNode = new Kinetic.Image({
            x: 54,
            y: stage.getHeight() / 2,
            image: handle,
            width: 20,
            height: 40,
            offset: [10, 20],
                  
            dragBoundFunc: function (pos) {
                var lowY = pos.y > 85 ? 85 : pos.y;
                var highY = pos.y < 15 ? 15 : pos.y;
                var newY;
                if (pos.y > 50) {
                    newY = lowY;
                } else {
                    newY = highY;
                }
                return {
                    x: this.getAbsolutePosition().x,
                    y: newY
                }
            }

        });
        
        leftNode.on("mouseover", function(){
   	        document.body.style.cursor = 'pointer';
   	        console.log("leftNode")
        });
        
        leftNode.on("mouseout", function(){
   	        document.body.style.cursor = 'default';
        });
        
        
        graph.leftNode = leftNode;

        //Right Node
        var rightNode = new Kinetic.Image({
            x: 370,
            y: stage.getHeight() / 2,
            image: handle,
            width: 20,
            height: 40,
            offset: [10, 20],
            
            dragBoundFunc: function (pos) {
                var lowY = pos.y > 85 ? 85 : pos.y;
                var highY = pos.y < 15 ? 15 : pos.y;
                var newY;
                if (pos.y > 50) {
                    newY = lowY;
                } else {
                    newY = highY;
                }
                return {
                    x: this.getAbsolutePosition().x,
                    y: newY
                }
            }
        });
        
        rightNode.on("mouseover", function(){
   	        document.body.style.cursor = 'pointer';
   	        console.log("right node")
        });
        
        rightNode.on("mouseout", function(){
   	        document.body.style.cursor = 'default';
        });
        
        graph.rightNode = rightNode;

        //Right Node
        var centerNode = new Kinetic.Image({
            x: stage.getWidth() / 2 - 90,
            y: stage.getHeight() / 2,
            image: handle,
            width: 20,
            height: 40,
            offset: [10, 20],
            
            dragBoundFunc: function (pos) {
                return {
                    x: this.getAbsolutePosition().x,
                    y: pos.y
                }
            }
        });
        
		
		
		//Variance Left Top
		var varLeftTop = new Kinetic.Image({
			x: 34,
            y: stage.getHeight() / 2 - graph.difference_left + 10,
            image: varHandle,
            width: 20,
            height: 20,
            offset: [10, 20],
            
            dragBoundFunc: function (pos) {
                var lowY = pos.y > 85 ? 85 : pos.y;
                var highY = pos.y < 15 ? 15 : pos.y;
                var newY;
                if (pos.y > 50) {
                    newY = lowY;
                } else {
                    newY = highY;
                }
                return {
                    x: this.getAbsolutePosition().x,
                    y: newY
                }
            }
		})
		
		varLeftTop.on("mouseover", function(){
   	        document.body.style.cursor = 'pointer';
			console.log("var left top")
        });
        
        varLeftTop.on("mouseout", function(){
   	        document.body.style.cursor = 'default';
        });
        
		//Variance Left Bottom
		var varLeftBottom = new Kinetic.Image({
			x: 34,
            y: stage.getHeight() / 2 + graph.difference_left + 10,
            image: varHandle,
            width: 20,
            height: 20,
            offset: [10, 20],
            
            dragBoundFunc: function (pos) {
                var lowY = pos.y > 85 ? 85 : pos.y;
                var highY = pos.y < 15 ? 15 : pos.y;
                var newY;
                if (pos.y > 50) {
                    newY = lowY;
                } else {
                    newY = highY;
                }
                return {
                    x: this.getAbsolutePosition().x,
                    y: newY
                }
            }
		});
		
		varLeftBottom.on("mouseover", function(){
   	        document.body.style.cursor = 'pointer';
			console.log("var Left Bottom")
        });
        
        varLeftBottom.on("mouseout", function(){
   	        document.body.style.cursor = 'default';
        });
		
		
		//Variance Left Top
		var varRightTop = new Kinetic.Image({
			x: 390,
            y: stage.getHeight() / 2 - graph.difference_right + 10,
            image: varHandle,
            width: 20,
            height: 20,
            offset: [10, 20],
            
		})
		
		//Variance Left Top
		var varRightBottom = new Kinetic.Image({
			x: 390,
            y: stage.getHeight() / 2 + graph.difference_right + 10,
            image: varHandle,
            width: 20,
            height: 20,
            offset: [10, 20],
            
		})
		
        //Central Line
        var line = new Kinetic.Line({
            points: [leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()],
            stroke: 'blue',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            
            dragBoundFunc: function (pos) {
                return {
                    x: this.getAbsolutePosition().x,
                    y: this.getAbsolutePosition().y
                }
            }
        });
        
        //Variance Line
        var vline = new Kinetic.Polygon({
            points:[leftNode.getX(), leftNode.getY() - graph.difference_left, rightNode.getX(), rightNode.getY() - graph.difference_right, rightNode.getX(), rightNode.getY() + graph.difference_right, leftNode.getX(), leftNode.getY() + graph.difference_left, leftNode.getX(), leftNode.getY() - graph.difference_left],
           // points: [leftNode.getX(), leftNode.getY() - 10, 73, 160, 340, 23, 500, 109, 499, 139, 342, 93],
        fill: 'rgba(0,0,0, .5)',
        stroke: 'none',
        strokeWidth: 1
          
        });
        
        var leftVarianceGroup = new Kinetic.Group({
        	
        	dragBoundFunc: function (pos) {
                var lowY = pos.y > 45 ? 45 : pos.y;
                var highY = pos.y < -45 ? -45 : pos.y;
                var newY;
                if (pos.y > 45) {
                    newY = lowY;
                } else {
                    newY = highY;
                }
                return {
                    x: this.getAbsolutePosition().x,
                    y: this.getAbsolutePosition().x,
                }
            }
            
        })
        
        leftVarianceGroup.on("mouseover", function(){
   	        document.body.style.cursor = 'pointer';
			console.log("Left variance group")
        });
        
        leftVarianceGroup.on("mouseout", function(){
   	        document.body.style.cursor = 'default';
        });
        
        graph.leftVarianceGroup = leftVarianceGroup;
        
        var rightVarianceGroup = new Kinetic.Group({
        	
        	dragBoundFunc: function (pos) {
                var lowY = pos.y > 45 ? 45 : pos.y;
                var highY = pos.y < -45 ? -45 : pos.y;
                var newY;
                if (pos.y > 45) {
                    newY = lowY;
                } else {
                    newY = highY;
                }
                return {
                    x: this.getAbsolutePosition().x,
                    y: this.getAbsolutePosition().x,
                }
            }
            
        })
        
        rightVarianceGroup.on("mouseover", function(){
   	        document.body.style.cursor = 'pointer';
			console.log("Right variance group")
        });
        
        rightVarianceGroup.on("mouseout", function(){
   	        document.body.style.cursor = 'default';
        });
        
        graph.rightVarianceGroup = rightVarianceGroup;

        rightNode.setDraggable(true);
        leftNode.setDraggable(true);
        
        
        leftVarianceGroup.setDraggable(true);
        rightVarianceGroup.setDraggable(true);
         
          
		layer.add(drawGraph());
      	if(type == "variation"){ layer.add(vline); };
        layer.add(line);
        layer.add(leftNode);
        layer.add(rightNode);
        if(type == "variation"){
        	
        	leftVarianceGroup.add(varLeftTop);
	        leftVarianceGroup.add(varLeftBottom);
	        layer.add(leftVarianceGroup);
	        rightVarianceGroup.add(varRightBottom);
	        rightVarianceGroup.add(varRightTop);
	        layer.add(rightVarianceGroup);
        }
       
      //  layer.add(drawGraph());
        stage.add(layer);
        
        var lastLeftY = 0;
        var lastRightY = 0;
        
        rightVarianceGroup.on('dragmove', function(ev){
			if(lastRightY > ev.clientY){
				console.log("LESSER")
				if(graph.difference_right < 30){
					graph.difference_right++;
				} else {
					graph.difference_right = 30;
				}
			} else {
				console.log("GREATER")
				if(graph.difference_right > 0){
					graph.difference_right--;
				} else {
					graph.difference_right = 0;
				}
			}
			updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);

			stage.draw();
			lastRightY = ev.clientY
        });
        
        
        leftVarianceGroup.on('dragmove', function(ev){
			if(lastLeftY > ev.clientY){
				console.log("LESSER")
				if(graph.difference_left < 30){
					graph.difference_left++;
				} else {
					graph.difference_left = 30;
				}
			} else {
				console.log("GREATER")
				if(graph.difference_left > 0){
					graph.difference_left--;
				} else {
					graph.difference_left = 0;
				}
			}
			updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);

			stage.draw();
			lastLeftY = ev.clientY
        });
        
        rightNode.on('dragstart', function() {
	      	//resizing = false;
	      	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
	      });
	      rightNode.on('dragmove', function() {
	      	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
	      });
	      rightNode.on('dragend', function() {
	      	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
	      });
	      
	      leftNode.on('dragstart', function() {
	      	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
	      });
	      leftNode.on('dragmove', function() {
	      	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
	      });
	      leftNode.on('dragend', function() {
	      });
        
        setInterval(function(){
	      	updateLineWithoutText([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
        },100)
        
        function updateLineWithoutText(points){
        	line.setPoints(points);
	      	vline.setPoints([leftNode.getX(), leftNode.getY() - graph.difference_left, rightNode.getX(), rightNode.getY() - graph.difference_right, rightNode.getX(), rightNode.getY() + graph.difference_right, leftNode.getX(), leftNode.getY() + graph.difference_left, leftNode.getX(), leftNode.getY() - graph.difference_left]);
			varLeftTop.setY(leftNode.getY() - graph.difference_left + 10);
			varLeftBottom.setY(leftNode.getY() + graph.difference_left + 10);
			varRightTop.setY(rightNode.getY() - graph.difference_right + 10);
			varRightBottom.setY(rightNode.getY() + graph.difference_right + 10);
			
	      	var changeInY = Math.round((rightNode.getY() - 50)/min/1.5);
      		var changeInY_Left = Math.round((leftNode.getY() - 50)/min/1.5);
	      	
	      	if(type == "no_variation"){
	      		changeInY = Math.round(((rightNode.getY() - 50)/min)*6.5);
      	 		changeInY_Left = Math.round(((leftNode.getY() - 50)/min)*6.5);
	      	}
	      	if(changeInY > max){
      	 		changeInY = max;
      	 	} else if(changeInY < min) {
      	 		changeInY = min;
      	 	}
      	 	
      	 	if(changeInY_Left > max){
      	 		changeInY_Left = max;
      	 	} else if(changeInY_Left < min) {
      	 		changeInY_Left = min;
      	 	}
	      	stage.draw();
        }
        
        function updateLine(points){
        	line.setPoints(points);
	      	vline.setPoints([leftNode.getX(), leftNode.getY() - graph.difference_left, rightNode.getX(), rightNode.getY() - graph.difference_right, rightNode.getX(), rightNode.getY() + graph.difference_right, leftNode.getX(), leftNode.getY() + graph.difference_left, leftNode.getX(), leftNode.getY() - graph.difference_left]);
			varLeftTop.setY(leftNode.getY() - graph.difference_left + 10);
			varLeftBottom.setY(leftNode.getY() + graph.difference_left + 10);
			varRightTop.setY(rightNode.getY() - graph.difference_right + 10);
			varRightBottom.setY(rightNode.getY() + graph.difference_right + 10);
			
	      	var changeInY = Math.round((rightNode.getY() - 50)/min * 30);
      		var changeInY_Left = Math.round((leftNode.getY() - 50)/min * 30);
	      	
	      	if(type == "no_variation"){
	      		changeInY = Math.round(((rightNode.getY() - 50)/min)*3);
      	 		changeInY_Left = Math.round(((leftNode.getY() - 50)/min)*3);
	      	}
	      	if(changeInY > max){
      	 		changeInY = max;
      	 	} else if(changeInY < min) {
      	 		changeInY = min;
      	 	}
      	 	
      	 	if(changeInY_Left > max){
      	 		changeInY_Left = max;
      	 	} else if(changeInY_Left < min) {
      	 		changeInY_Left = min;
      	 	}
      	 	$(container).find('.endNumber').val(changeInY);
      	 	$(container).find('.startNumber').val(changeInY_Left);
	      	
	      	if(type == "variation"){
	      		$(container).find('.varendNumber').val(graph.difference_right);
      	 		$(container).find('.varstartNumber').val(graph.difference_left);
	      	}
	      	graph.startMeanVal = $(container).find('.startNumber').val();
	        graph.endMeanVal = $(container).find('.endNumber').val();
	        if(type == "variation"){
	        	 graph.startVarVal = $(container).find('.varstartNumber').val();
	       		 graph.endVarVal = $(container).find('.varendNumber').val();
	        }
	      	
	      	stage.draw();
	      	
        }
        
        
        graph.startMeanVal = $(container).find('.startNumber').val();
        graph.endMeanVal = $(container).find('.endNumber').val();
        if(type == "variation"){
        	 graph.startVarVal = $(container).find('.varstartNumber').val();
       		 graph.endVarVal = $(container).find('.varendNumber').val();
        }
        
        $(container).find('.startNumber').change(function(e){
        	console.log(e.target.value);
        	if(Math.abs(parseFloat(e.target.value)) > max) {return;}

        	leftNode.setY((stage.getHeight() / 2) + parseFloat(e.target.value)*-2.26);
        	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
        	stage.draw();
        })
        
        $(container).find('.endNumber').change(function(e){
        	console.log(e.target.value);
        	if(Math.abs(parseFloat(e.target.value)) > max) {return;}
        	rightNode.setY((stage.getHeight() / 2) + parseFloat(e.target.value)*-2.26);
        	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
        	stage.draw();
        })
        
          $(container).find('.varstartNumber').change(function(e){
          	if(Math.abs(parseFloat(e.target.value)) > 20 || parseFloat(e.target.value) < 0) {return;}
          	graph.difference_left = parseFloat(e.target.value);
          	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
          });
          
          $(container).find('.varendNumber').change(function(e){
          	if(Math.abs(parseFloat(e.target.value)) > 20 || parseFloat(e.target.value) < 0) {return;}
          	graph.difference_right = parseFloat(e.target.value);
          	updateLine([leftNode.getX(), leftNode.getY(), rightNode.getX(), rightNode.getY()]);
          });
      	
      	//Draw Graph Background
      function drawGraph(){
      	
      	var YAxis = new Kinetic.Line({
	        points: [40, 0, 40, stage.getHeight()],
	        stroke: 'black',
	        strokeWidth: 1
	       
	      });
	    
	    var XAxis = new Kinetic.Line({
	        points: [40, stage.getHeight()/2 + 1, 370, stage.getHeight()/2 + 1],
	        stroke: 'black',
	        strokeWidth: 1
	       
	      });
	      
	     var XAxisText = new Kinetic.Text({
	        x: stage.getWidth() / 2 - 100,
	        y: stage.getHeight()/2 + 30,
	        text: xLabel,
	        fontSize: 13,
	        fontFamily: 'Calibri',
	        fill: 'black'
	      });
	      
	      var XAxisNumber = new Kinetic.Text({
	        x: stage.getWidth() / 2 - 240,
	        y: stage.getHeight()/2 + 20,
	        text: "                              2013                                                                                    2043",
	        fontSize: 13,
	        fontFamily: 'Calibri',
	        fill: 'black'
	      });
	      
	      var YAxisText = new Kinetic.Text({
	        x: 40,
	        y: stage.getHeight()/2 + 20,
	        text: yLabel,
	        fontSize: 13,
	        fontFamily: 'Calibri',
	        offset: [20, (stage.getHeight()/2 + 15)/2],
	        fill: 'black'
	      });
	      
	      YAxisText.setRotationDeg(-90);
		   
		   
		  var YAxisNumber= new Kinetic.Text({
	        x: 25,
	        y: stage.getHeight()/2 + 40,
	        text: min + "        0        " + max,
	        fontSize: 15,
	        fontFamily: 'Calibri',
	        fill: 'black'
	      });    
	       YAxisNumber.setRotationDeg(-90);
	      
	    var graphGroup = new Kinetic.Group({
	      	
	      });
	      
	       graphGroup.add(YAxis);
	       graphGroup.add(XAxis);
	       graphGroup.add(XAxisText);
	       graphGroup.add(YAxisText);
	       graphGroup.add(YAxisNumber);
	       graphGroup.add(XAxisNumber);
	       
   	       graph.xAxisNumber = XAxisNumber;
 
      
      
      
      return graphGroup;
      }
		
		setInterval(function(){
			stage.draw();
		},1000)
        
    }
    
   function populateInputs(data){
   		console.log(data);
   		for(var i=0;i<graphObject.length;i++){
   			console.log(graphObject[i].name);
   			if(graphObject[i].name == "WeatherModel_Precipitation" || graphObject[i].name == "Baseline_Precipitation"){
   				$(graphObject[i].container).find('.startNumber').val(data.precip_mean_y1);
   				
   				console.log(graphObject[i].leftNode);
   				graphObject[i].leftNode.setY((graphObject[i].stage.getHeight() / 2) + parseFloat(data.precip_mean_y1)*-6.8);
   				$(graphObject[i].container).find('.endNumber').val(data.precip_mean_yn);
        		graphObject[i].rightNode.setY((graphObject[i].stage.getHeight() / 2) + parseFloat(data.precip_mean_yn)*-6.8);
   				$(graphObject[i].container).find('.varstartNumber').val(data.precip_var_y1);
   				graphObject[i].difference_left = parseFloat(data.precip_var_y1);
   				$(graphObject[i].container).find('.varendNumber').val(data.precip_var_yn);
          		graphObject[i].difference_right = parseFloat(data.precip_var_yn);
   			}
   			if(graphObject[i].name == "WeatherModel_Temperature" || graphObject[i].name == "Baseline_Temperature"){
   				$(graphObject[i].container).find('.startNumber').val(data.temp_mean_y1);
   				graphObject[i].leftNode.setY((graphObject[i].stage.getHeight() / 2) + parseFloat(data.temp_mean_y1)*-2.26);
   				$(graphObject[i].container).find('.endNumber').val(data.temp_mean_yn);
        		graphObject[i].rightNode.setY((graphObject[i].stage.getHeight() / 2) + parseFloat(data.temp_mean_yn)*-2.26);
        	}
   		}
   }
   
   function disableInputs(){
   		for(var i=0;i<graphObject.length;i++){
   			graphObject[i].leftNode.setDraggable(false);
   			graphObject[i].rightNode.setDraggable(false);
   			graphObject[i].rightVarianceGroup.setDraggable(false);
   			graphObject[i].leftVarianceGroup.setDraggable(false);
   		}
   }
   
   function enableInputs(){
   		for(var i=0;i<graphObject.length;i++){
   			graphObject[i].leftNode.setDraggable(true);
   			graphObject[i].rightNode.setDraggable(true);
   			graphObject[i].rightVarianceGroup.setDraggable(true);
   			graphObject[i].leftVarianceGroup.setDraggable(true);
   		}
   }
    

    return {
        initGraph: initGraph,
        enableInputs:enableInputs,
        populateInputs:populateInputs,
        updateDate:updateDate,
        disableInputs:disableInputs,
    }
})();