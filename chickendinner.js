"use strict";
var argv = require('minimist')(process.argv.slice(2));
//var http = require('http');
var later = require('later');
//var merge = require('merge-descriptors');
var lightspeed = require('./lightspeed');
//var server = require('./server');
var express = require('express');
var session = require('express-session');





var username = argv['u'];
var password = argv['p'];

var ls = new lightspeed(username, password);
ls.totals[ls.BERGEN_ID] = 1;
ls.totals[ls.WILLIAMSBURG_ID] = 1;

var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'pug');
app.set('views', './views');
//app.use(express.bodyParser());


app.locals.lightspeed = ls;

app.get('/', function(req, res) {
    res.render('index', {});

});

app.get('/totals', function(req,res) {
    
    if (req.session.loggedin) {
        res.end(JSON.stringify(req.app.locals.lightspeed.totals));
    } else {
        res.end(JSON.stringify("Please log in"));
    }
    
});

app.post('/login', function(req,res) {
    //res.render('templates/index', {});
});


app.listen(8080, function () {
  console.log('Example app listening on port 3000!');
});

/*
var server = new server(ls);

var app = function(req,res) {
    server.handle(req,res);
};

merge(app,server);

http.createServer(app).listen(8080);

console.log('Server running on port 8080.');
*/



var scheduled_job = function(lightspeed) {
	console.log('running scheduled job');
    lightspeed.update_totals(lightspeed);    
	
};
/*
scheduled_job(ls);

// every 15 minutes from 9am - 8pm.
var cronSched = later.parse.recur().every(5).minute().after('00:00').time().before('19:00').time();
var timer = later.setInterval(scheduled_job.bind(null, ls, totals), cronSched);

*/





