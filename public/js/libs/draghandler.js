
var DragHandler = {
 
 
	// private property.
	_oElem : null,
 
 
	// public method. Attach drag handler to an element.
	attach : function(oElem) {
		if ('ontouchstart' in document){
			oElem.ontouchstart = DragHandler._dragBeginTouch;
		}
		oElem.onmousedown = DragHandler._dragBegin;
 
		// callbacks
		oElem.dragBegin = new Function();
		oElem.drag = new Function();
		oElem.dragEnd = new Function();
 
		return oElem;
	},
	
	
	deattach : function(oElem){
		oElem.onmousedown = null;
 
		// callbacks
		oElem.dragBegin =null;
		oElem.drag = null;
		oElem.dragEnd = null;
 
		return oElem;
	},
 
 	_test : function(e){
 		console.log("LOL")
 	},
 	
	// private method. Begin drag process.
	_dragBegin : function(e) {
		var oElem = DragHandler._oElem = this;
 
		if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = '0px'; }
		if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = '0px'; }
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
		oElem.mouseX = e.clientX;
		oElem.mouseY = e.clientY;
		
		oElem.style.zIndex = 1000;
 
		oElem.dragBegin(oElem, x, y);
 
		document.onmousemove = DragHandler._drag;
		document.onmouseup = DragHandler._dragEnd;
		return false;
	},
	
	_dragBeginTouch : function(e) {
		console.log("TRACK");
		var oElem = DragHandler._oElem = this;
 
		if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = '0px'; }
		if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = '0px'; }
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
		
		oElem.mouseX = e.targetTouches[0].pageX;
		oElem.mouseY = e.targetTouches[0].pageY;
		
		oElem.style.zIndex = 1000;
 
		oElem.dragBegin(oElem, x, y);
 
		document.ontouchmove = DragHandler._dragTouch;
		document.ontouchend = DragHandler._dragEndTouch;
		return false;
	},
 	
 	_dragTouch : function(e){
 		console.log("X");
 		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
		oElem.style.left = x + (e.targetTouches[0].pageX - oElem.mouseX) + 'px';
		oElem.style.top = y + (e.targetTouches[0].pageY - oElem.mouseY) + 'px';
 
		oElem.mouseX = e.targetTouches[0].pageX;
		oElem.mouseY = e.targetTouches[0].pageY;
 
		oElem.drag(oElem, x, y);
 
		return false;
 	},
 	_dragEndTouch : function(e){
 		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 		//console.log(x + " ::: " + y)
		oElem.dragEnd(oElem, x, y);
 
		document.ontouchmove = null;
		document.ontouchend = null;
		DragHandler._oElem = null;
 	},
 
	// private method. Drag (move) element.
	_drag : function(e) {
		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 
		e = e ? e : window.event;
		oElem.style.left = x + (e.clientX - oElem.mouseX) + 'px';
		oElem.style.top = y + (e.clientY - oElem.mouseY) + 'px';
 
		oElem.mouseX = e.clientX;
		oElem.mouseY = e.clientY;
 
		oElem.drag(oElem, x, y);
 
		return false;
	},
 
 
	// private method. Stop drag process.
	_dragEnd : function() {
		var oElem = DragHandler._oElem;
 
		var x = parseInt(oElem.style.left);
		var y = parseInt(oElem.style.top);
 		//console.log(x + " ::: " + y)
		oElem.dragEnd(oElem, x, y);
 
		document.onmousemove = null;
		document.onmouseup = null;
		DragHandler._oElem = null;
	}
 
}
