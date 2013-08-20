// A prototype for the prompts
function prompt ($, marker, infoWindow) {
  var p1 = $('<p>Is this the basin you wanted? ' +
             '<a id="p1-yes" href="">Yes</a> or ' +
             '<a id="p1-no" href="">No</a></p>');

  $(p1).find('#p1-yes').click(function (event) {
    $(p1).append(p2);
  });

  $(p1).find('#p1-no').click(function (event) {
    // handle no.
  });

  var p2 = $('<form>' +
             '<input type="radio" id="p2-drainage">Drainage</input><br/>' +
             '<input type="radio" id="p2-other">Other Model</input><br/>' +
             '</form>');

  $(p2).find('#p2-drainage').click(function (event) {
    // handle.
  });
  
  return {
    // A reference to the google maps InfoWindow object:
    info: infoWindow,
  };
}