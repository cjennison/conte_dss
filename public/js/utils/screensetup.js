screenSetup = {
	
	screenWidth:0,
	screenHeight:0,
	screenRatio:0,
	
	//Temporary Solution for Small Monitors
	currentZoom:0,
	
	
	optomize:function(){
		
		screenSetup.screenWidth = screenSetup.getWidthOfScreen();
		screenSetup.screenHeight = screenSetup.getHeightOfScreen();
		screenSetup.screenRatio = screenSetup.screenWidth/screenSetup.screenHeight;
		
		console.log("You're Browser size is: " + screenSetup.screenWidth + ", " + screenSetup.screenHeight)
		console.log("You have a ratio of: " + screenSetup.screenRatio)
		
		screenSetup.zoom(screenSetup.screenWidth, screenSetup.screenRatio)
		
	},
	
	zoom:function(width, ratio){
		var wdth = ratio; 
		//document.body.style.zoom = (100 - (ratio * 10)) + "%";
		if(width < 900){
			document.body.style.zoom = "70%"
			//TODO: Needs reevaluation for better method
			$("#weather-models-app div #weather_generator #graphcontainer2").css("margin-top", "-27px")
			$("#weather-models-app div #baseline_shift #baselineHistoric_graphcontainer2").css("margin-top", "-27px")

		}
		else{
			document.body.style.zoom = "85%"
		}
		
		console.log(wdth)
	},
	
	getWidthOfScreen:function(){
		return window.innerWidth;
	},
	
	getHeightOfScreen:function(){
		return window.innerHeight;
	}
	
	
}
