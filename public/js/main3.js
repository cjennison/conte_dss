/** The main module for the Streams application.
 */
var Streams = {};
Streams.user = null;

var Tools = {};

// Connect to the server using SocketIO:
Streams.socket = io.connect();

$(function () {
	
Streams.user = $(".username").html();
console.log(Streams.user);
	
  Streams.view = $('body');
  
  $.get("/database/user").done(function(){
  
  }); //Check user in database
  /*	var missed = $.post("/database/get-missed-runs");
  	setTimeout(function(){
  		console.log("MISSEDMISSEDMISSEDMISSEDMISSEDMISSEDMISSEDMISSEDMISSEDMISSED")
  		console.log(missed);
  		var result = Output.runInformation.parseResponse(missed.responseText);
  		if(result.missed_runs.length > 0){
  			console.log("There are missed runs!")
  			Popup.missedRunPopup(result.missed_runs);
  		}
  		console.log(result);
  	},2000)
  	
  	*/
  Streams.map.init();
  Streams.app_control.init();

  Streams.map.render();
  Streams.app_control.render();
  
  //Chart.init("#tree", "../json/data.json", 800, 385, 200, 010, 210, 180, 25, "null");
  //Chart.init("#treeContainer", "../json/data2.json", 1100, 455, 55, 70, 147, 80, 25, "output", true);
  initNavigation();
  Status.init();
  
  //screenSetup.optomize();
  initDebug();
  initOutput();
  Output.buildHistory();
  
  //TODO move and make non-set value
  Graphing.init(9);

setInterval(function(){
	$("html, body").animate({ scrollTop: 0 }, "slow");
},100);
  
  setInterval(function(){
  		//console.log('check')
	  	var time = Time.time();
	  	var updater = $.post('/database/user-time', {"time": time}); //update time
	  },10000)
  
  
});

function initNavigation(){
	$("#navBar #historyButton").button({disabled:false});
	$("#navBar #inputButton").button({disabled:false});
	$("#navBar #outputButton").button({disabled:false});
	$("#navBar #graphButton").button({disabled:false});
	
	$("#navBar #inputButton").bind("click", function(){
		removeOutput();
		$("#inputWrapper").css("top","0%");
		$("#outputWrapper").css("top","100%");
		$("#graphWrapper").css("top","200%");
				$(".panelBackground").css("opacity", 0);

	});
	
	$("#navBar #outputButton").bind("click", function(){
		initOutput();
		$("#inputWrapper").css("top","-100%");
		$("#outputWrapper").css("top","0%");
		$("#graphWrapper").css("top","100%");
		$("#outputWrapper").css("left","0%");

		$(".panelBackground").css("opacity", .9);
	});
	
	$("#navBar #historyButton").bind("click", function(){
		initOutput();
		$("#inputWrapper").css("top","-100%");
		$("#outputWrapper").css("top","0%");
		$("#graphWrapper").css("top","100%");
		$("#outputWrapper").css("left","-100%");
		$(".panelBackground").css("opacity", .9);
	});
	
	
	$("#navBar #graphButton").bind("click", function(){
		removeOutput();
		initGraph();
		$("#inputWrapper").css("top","-200%");
		$("#outputWrapper").css("top","-100%");
		$("#graphWrapper").css("top","0%");
	});
}

function enableButton(button){
	$("#navigation #"+ button).button({disabled:false});
}

(function($) {
    $.fn.getAttributes = function() {
        var attributes = {}; 

        if( this.length ) {
            $.each( this[0].attributes, function( index, attr ) {
                attributes[ attr.name ] = attr.value;
            } ); 
        }

        return attributes;
    };
})(jQuery);

function clearThumbnailsFromChild(child){
	var thumbnails = $('#thumbnailList li');
	for(var i = (child); i < thumbnails.length; i++){
		$(thumbnails[i]).remove();
	}
}
