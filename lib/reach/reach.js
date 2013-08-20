// Here is experimental support for working with the stream data

// NOTES
// We need to represent the stream network in some way. I am not
// sure how to do this yet. The first pass will be to load in the
// sample KML file for Fort River and then work off of that.
// Eventually, this should be accessing a database in some way.

var fs     = require('fs');
var xml2js = require('xml2js');
var util   = require('util');

function log (str) {
  console.log('reach.js: ' + str);
}

// This will be our in memory object of the extended data
// associated with the Fort River KML file. It is initialized
// by the KML functionality below. You can assume that it will
// refer to a dictionary of objects that are mapped from names
// to their extended data. At the moment we can only update or
// search the data if there is a corresponding name of a placemark
// in the KML file.
// NOTE: does this mean we need to assign dummy names to the
// anonymous placemarks so that we can access them from the client?
var xdata;

// Retrieves the extended data object of a reach if it exists;
// false otherwise.
function getExtendedData (name) {
  return xdata[name] ? xdata[name] : {};
}

//// Exported Functions: ////
exports.getExtendedData = getExtendedData;

//// Functions on the KML object ////

// Everything below are support routines for reading in the
// KML data for the Fort River streams and generating JS
// objects for the extended data. This can then be used as
// an in memory database to be updated by the client. This
// should be replaced by a database in the future.

// Read in the KML file:
(function () {
  // Create the xml2js parser:
  var parser = new xml2js.Parser();

  // Read the file in and parse:
  fs.readFile('./public/Fort_River.kml',
    function (err, data) {
      if (!err) {
        parser.parseString(data, function (err, result) {
          log('Parsed in Fort_River.kml');
          // We set the fortRiver variable in here. Need to
          // make sure we can't query it before it is finished
          // begin parsed in - otherwise dragons be here.
          xdata = buildExtendedDataMap(result);          
        });
      }
      else {
        throw 'Error reading Fort_River.kml: ' + err;
      }
    });
})();

// Return the placemarks array. This is the top-most element in the
// KML structure that contains all of the placemarks. Each placemark
// contains structure that eventually leads to the extended data.
function placemarks (kmlobj) {
  return kmlobj.Document.Folder.Placemark;
}

// Return the extended data associated with a placemark name. A
// Placemark marks a point on the google map surface. Currently,
// we are most interested in the "ExtendedData" information as
// this is not accessible from the object created by google earth
// when we place a KML layer on a google map.
function buildExtendedDataMap (kmlobj) {
  // This is a mapping from a placemark name to its extended data:
  var xdata = {};

  // Extract the extended data from the placemarks:
  var marks = placemarks(kmlobj);

  for (var i = 0; i < marks.length; i++) {
    var mark  = marks[i];
    var name  = mark.name ? mark.name : 'Anonymous' + i;
    var sdata = mark.ExtendedData.SchemaData.SimpleData;
    var edobj = {};
    for (var j = 0; j < sdata.length; j++) {
      edobj[sdata[j]['@'].name] = sdata[j]['#'] ? sdata[j]['#'] : undefined;
    }

    xdata[name] = edobj;
  }

  return xdata;
}
