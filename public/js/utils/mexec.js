Streams.Mexec = {
	name : 'Mexec',
	
	dataObject:{
		
	},
	
	/**
	 * 
 * @param {Object} options All params
	 */
	fillDataObject:function(object){
		this.dataObject = object;
		
	},
	
	
	
	run:function(){
		var test = $.get('/mexec?climate:{flag:true, scriptName:"weather_generator"}');
		
		setTimeout(function(){
			console.log(test);
		},3000)
	}
	
};
