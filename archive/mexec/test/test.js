var mexec = require('../../../routes/mexec.js');
var basin = require('../../basin');

var app = require('express').createServer(
	//require('express').logger(),
	require('express').bodyParser()

	);

app.get('/',function(req,res){
	console.log('get the link');
	res.send('ello');
});

app.get('/form', function (req, res) {
    //var content = tolist();
    var content = '<h3>Make A Creator!</h3>';
    // ADDITION: changed method from "get" to "post"
    content += '<form method="post" action="/runModle" >' +
        'runId: <input type="text" name="runId" /><br/>' +
        'User: <input type="text" name="user" value="user1234"/><br/>' +
        'R Script: <input type="text" name="scriptName" value="weather_generator"/><br/>' +
        '<input type="submit" value="run modle"/>' +


        'Uuser: <input type="text" name="uuser"/><br/>' +
        'Iunfo: <input type="text" name="iunfo"/><br/>' +
        '<input type="submit" value="another but"/>' +
        '</form>';
    res.send(content);
});

app.post('/basin/user/delineate', basin.delineateBasin);

// ADDITION: changed app.get to app.post
app.post('/runModle',mexec.exec);

app.listen(1005);