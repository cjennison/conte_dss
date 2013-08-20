var Time = {
	
	time:function(){
		var d = new Date();
		return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " - " + d.getHours() + ":" + d.getMinutes();
	},
	
	
	splitTime:function(){
		var time = "5/10/2013 - 10:43";
		var n = time.split(" - ");
		var date = n[0];
		var base_time = n[1];
		
		base_time = base_time.split(":");
		date = date.split("/");
		
		console.log(base_time);
		console.log(date);
	}
	
}
