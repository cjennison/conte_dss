function Step(opts){
	
	this.alias = opts.alias;
	this.user  = opts.user;
	this.stepID = opts.stepID;
	this.script = opts.scriptName + ".R";
	this.basinid = opts.basin_id;
	this.settings = opts;
	this.step = opts.step;
	this.skipped = opts.skipped;
    this.preceding = {};
    this.parent = opts.parent;
    this.output = '';
    this.status = 'QUEUED';
    
	//Settings File Information to be written
	this.settings.step      = opts.step;
    this.settings.basin_id  = opts.basin_id;
    this.settings.preceding = {};
    this.settings.stepID    = opts.stepID;
    this.settings.parent    = opts.parent;
	
	return this;
}



exports.Step = Step;