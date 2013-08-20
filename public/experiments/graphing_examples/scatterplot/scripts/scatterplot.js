var active_popup = null;

function initSeriesToggle(){
	var svg = $("body");
	
	var toggle = $("<div id='toggle'><ul></ul></div>")
	$(svg).append(toggle);
}


function addToToggle(series_label, color){
	var toggle = $("#toggle ul")
	var li = $("<li></li>");
	var span = $("<span class='ser-label'> " + series_label + "</span>")
	
	var canvas = $("<canvas width='25' height='25'>")
	
	$(canvas).drawEllipse({
		layer:true,
		  fillStyle: color,
		  strokeStyle: "#36c",
 		 strokeWidth: 2,
		  x: 6, y: 6,
		  width: 10, height: 10,
		 click: function(layer) {
			    // Spin star
			    console.log(layer);
			    if(layer.fillStyle != "rgb(255,255,255)"){
			    	 $(this).animateLayer(layer, {
				      fillStyle: 'rgb(255,255,255)'
				    });
				    togglePoints(series_label, "OFF")
			    } else {
			    	 $(this).animateLayer(layer, {
				      fillStyle: color
				    });
				    togglePoints(series_label, "ON")

			    }
			    
			   
			  }
		});
	
	$(li).append(canvas);
	$(li).append(span);
	
	$(toggle).append(li);
}

function togglePoints(series, state){
	 $(".data-popup").remove();
	var circles = $('circle');
	console.log(circles);
	
	for(var i = 0;i<circles.length;i++){
		
		if($(circles[i]).attr("series") == series){
			if(state == "OFF"){
			$(circles[i]).css("opacity", 0)
		} else {
			$(circles[i]).css("opacity", 1)
		}
		}
		
		
	}
}

function attachListeners(){
	console.log(dataset)
	$(".circle").on('click', function(e){
		console.log(e);
		var data = $(this).attr("data");
		data = data.split(', ')
		spawnPopup(data, $(this).attr("series"), e);	
	})
	
	$("body").on('click', function(e){
		//$(".data-popup").remove();
	})
}


function spawnPopup(data, series, event){
	console.log(data);
	$(".data-popup").remove();
	
	
	var pop = $("<div class='data-popup'><span class='data'> Year:" + data[0] + ", Amount: " + data[1] + "</span></div>");
	$(pop).css("top", event.pageY - 20)
	$(pop).css("left", event.pageX)
	$("body").append(pop)
	
	
}
