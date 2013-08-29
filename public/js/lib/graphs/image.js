AutoGraph.graphs.image = {
	init:function(data, div){
		var img = new AutoImage(data);
		
		$(div).css("background-image","url(" + img.url + ")");
		$(div).css("background-size","100% 100%");
		return img;
	}

}

function AutoImage(data){
	this.graphType = data.graphType;
	this.title = data.title;
	this.url = data.url;

	return this;

}