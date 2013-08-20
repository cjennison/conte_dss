var Popup = {
	missedRunPopup:function(runs){
		var popup = $("<div id='missed-runs'><img id='closebtn' src='../images/closebtn.png' width='50px' height='50px'><span id='popup-title'><h1>Welcome Back!</h1><br>These runs completed while you were gone: </div>"),
			run_list = $("<ul></ul>");
			
		$(popup).find("img").click(function(e){
			console.log("removing")
			$(popup).remove();
		});
		
		for(var i=0;i<runs.length;i++){
			var list_item = $("<li></li>");
			$(run_list).append(list_item);	
		}
		
		$(popup).append(run_list);
		
		$("body").append(popup);
	}
}
