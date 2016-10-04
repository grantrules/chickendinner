"use strict";
var argv = require('minimist')(process.argv.slice(2));
var later = require('later');later.date.localTime();
var lightspeed = require('./lightspeed');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var path = require('path');



var username = argv['u'];
var password = argv['p'];

var ls = new lightspeed(username, password);
ls.totals[ls.BERGEN_ID] = 0;
ls.totals[ls.WILLIAMSBURG_ID] = 0;

var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


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

app.post('/login', urlencodedParser, function(req,res) {
    res.writeHead(200, {"Content-Type": "application/json"});
    if (req.body.password == "abc123") {
        req.session.loggedin = true;
        res.end(JSON.stringify("ok"));
    } else {
        req.session.loggedin = false;
        res.end(JSON.stringify("not logged in"));
    }
});


app.listen(8080, function () {
  console.log('server listening on 8080');
});




var scheduled_job = function(lightspeed) {
	console.log('running scheduled job');
    //lightspeed.update_totals(lightspeed);    
	
};

scheduled_job(ls);

// every 15 minutes from 9am - 8pm.
var cronSched = later.parse.recur().every(5).minute().after('08:00').time().before('19:00').time();
var timer = later.setInterval(scheduled_job.bind(null, ls), cronSched);

