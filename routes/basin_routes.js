var basin = require('../lib/basin');

// preDefinedBasins returns to the client a list of JSON objects that
// represent the predefined basins.
exports.preDefinedBasins = function (req, res) {
  basin.preDefinedBasins(function (err, basins) {
    if (err) {
      console.log('Error retrieving predefined basins!');
      console.log(err.msg);
      res.json(err);
    }
    else {
      res.json(basins);
    }
  });
};

// basinInfo returns to the client information for a basin given its
// id.
exports.basinInfo = function (req, res) {
  var id = req.params.id;
  basin.basinInfo(id, function (err, basin) {
    if (err) {
      console.log('Error retrieving basin ' + id + '!');
      console.log(err.msg);
      res.json(err);
    }
    else {
      res.json(basin);
    }
  });
};

// userBasinList returns to the client the list of basins for a
// particular user and their aliases.
exports.userBasinList = function (req, res) {
	console.log("Getting User Set Basins")
  var user = req.session.user;
  basin.userBasinList(user, function (err, basins) {
    if (err) {
      console.log('Error retrieving all basins!');
      console.log(err.msg);
      res.json(err);
    }
    else {
      res.json(basins);
    }    
  });
};

exports.addBasin_IDAlias = function(req,res){
  var user = req.session.user;
  var IDAlias = req.body;   
  basin.addBasin_IDAlias(user,IDAlias,function(err,list){
    if(err){
      console.log('Error updating ID-Alias: '+IDAlias);
      console.log(err.msg);
      res.json(err);
    }else{
      res.json(list);
    }
  });
};


exports.getBasinDams = function(req, res){
	var user = req.session.user,
		basinID = req.body.basin_id;

	res.json({data:basinID});
}

exports.delineateBasin = function(req, res) {
  var user = req.session.user;
  if (!user) {
    res.redirect('/login');
  }
  else {
    var lat = parseFloat(req.body.lat);
    var lng = parseFloat(req.body.lng);

    if (!lat || !lng) {
      res.json({ err : 'Bad request. Expected latitude/longitude' });
    }
    else {
      var a = {basinID: "xxx"};
      basin.delineateBasin(lat, lng, function(err, basinId) {
        if(err) {
          res.json(err);
        }else{
        	a.basinID = basinId;
        	res.json(a);
        }
      });
      //res.json(a);
    }
  }
};