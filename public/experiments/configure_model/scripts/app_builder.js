var apps = {};

var AppBuilder = {
	
	
	buildApplication:function(data){
		var app_window = $("<div id='" + data.step + "-app' class='input_window'><span class='step-title'>step_name</span></div>");
		apps[data.step] = data;
		$("body").append(app_window);
		
		//1 -- Define Title and Dropdown list
		$(app_window).find(".step-title").html(data.step_alias);
		var dropdown = $("<select class='script_selector'></select>")
		for(var i = 0;i < data.scripts.length;i++){
			var opt = $("<option value=" + data.scripts[i].scriptname + ">" + data.scripts[i].script_alias + "</option>");
			$(dropdown).append(opt);
		}
		$(app_window).append(dropdown);
		
		//2 -- Define Windows for Each Script
		for(var q = 0;q < data.scripts.length;q++){
			var step_window = $("<div class='app-window' id=" + data.scripts[q].scriptname + "-window style='display:none'>" 
			+ "<span class='info'>horse</span>" 
			+ "</div>")
			
			$(app_window).append(step_window);
		}
		//2.1 -- Add Listener for changing scripts
		$(dropdown).change(function(){
			var change_value = $("#input_window select option:selected").val()
		})
		
	}
	
	
}


