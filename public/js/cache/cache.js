var Cache = {
	
	saveStep:function(stepID, status){
		$.jStorage.set(stepID, {
			"stepID":stepID,
			"status":status
			})
	},
	
	getSteps:function(){
		var index = $.jStorage.index();
			console.log(index); 
			
		return index;
	},
	
	clearCache:function(){
		var index = $.jStorage.index();
			console.log(index); 
			
		for(var i = 0;i < index.length;i++){
			$.jStorage.deleteKey(index[i])
		}
	}
	
	
}
