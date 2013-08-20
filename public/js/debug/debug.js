var debug = false;

function initDebug(){
	console.log("DEBUG")
	$(document).keydown(function(e){
		if(e.keyCode == 192){
			dropdownDebug();
		}
	});
	
	$("#debug").mousedown(function(){
		Streams.app_control.apps.basin.bypassBasin = true;
		
	})


}


function dropdownDebug(){
	if($("#debug").css("top") == "10px"){
		$("#debug").css("top", "-100px");
	}else {
		$("#debug").css("top", "10px");
	}
	
	setTimeout(function(){
		$("#debug").css("top", "-100px");
	},5000)
	
}
