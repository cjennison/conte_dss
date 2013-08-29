function layerSwitch(element, layerID) {
	switch(layerID) {
		case "landCov":
			landCov.setVisibility(element.checked);
			break;
		case "USstates":
			USstates.setVisibility(element.checked);
			break;
		case "rivers":
			rivers.setVisibility(element.checked);
			break;
	}		
}