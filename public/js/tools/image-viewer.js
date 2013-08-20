Tools.image_viewer = {
	
	img:null,
	img_container:null,
	
	init:function(img_url){
		console.log(img_url)
		Tools.image_viewer.img = img_url;
		
		var container = $("<div id='img-shadowbox'></div><div id='img-viewer-container'><img src=" + img_url + " width='100%'></div>");
		$("body").append(container);
		
		
		$("#img-shadowbox").on('click',function(e){
			$(container).remove();
		})
	}
}
