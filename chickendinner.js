"use strict";
var argv = require('minimist')(process.argv.slice(2));
var http = require('http');
var later = require('later');
var merge = require('merge-descriptors');
var lightspeed = require('./lightspeed');


var username = argv['u'];
var password = argv['p'];

var ls = new lightspeed(username, password);

var totals = {'williamsburg': 0,'bergen': 0};

var app = function(req,res) {
    ls.handle(req,res);
};

ls.totals[ls.BERGEN_ID] = 1;
ls.totals[ls.WILLIAMSBURG_ID] = 1;

merge(app,ls);

http.createServer(app).listen(8080);

console.log('Server running on port 8080.');

var scheduled_job = function(lightspeed, totals) {
	console.log('running scheduled job');
    lightspeed.update_totals(lightspeed);    
	
};


scheduled_job(ls,totals);

// every 15 minutes from 9am - 8pm.
var cronSched = later.parse.recur().every(5).minute().after('00:00').time().before('19:00').time();
var timer = later.setInterval(scheduled_job.bind(null, ls, totals), cronSched);






/*

Post to:

https://east27.merchantos.com/register.php
post data: login_name=grant%40ridebrooklynny.com&login_password=xxxxx&form_name=login&cordova=0
Name

save cookie


payments received report:

GET /ajax_forms.php?ajax=1&no_cache=1473129016082&form_name=listing.refresh&ajax_listing=%7B%22draw_all%22%3Afalse%2C%22draw_tab_only%22%3Afalse%2C%22name%22%3A%22reports.register.listings.payments%22%2C%22request%22%3Afalse%2C%22saved_search%22%3A%7B%22start_date%22%3A%222016-09-05%22%2C%22end_date%22%3A%222016-09-05%22%2C%22payment_type_id%22%3A%22-1%22%2C%22register_id%22%3A%22-1%22%2C%22shop_id%22%3A%225%22%7D%2C%22sort%22%3A%22amount%22%2C%22sort_dir%22%3A%22DESC%22%2C%22count%22%3A%22105%22%2C%22page%22%3A1%2C%22page_count%22%3A2%2C%22tab%22%3A%22single%22%2C%22display_search%22%3Atrue%2C%22display_advanced%22%3A%221%22%2C%22page_size%22%3A%22100%22%2C%22max_size%22%3A100%2C%22page_controls%22%3Atrue%2C%22is_child_list%22%3Afalse%2C%22title%22%3A%22Payments%22%2C%22type%22%3A%22listing%22%2C%22deleted_rows%22%3Anull%2C%22user_search%22%3Atrue%7D&key_values=%7B%22start_date%22%3A%222016-09-05%22%2C%22end_date%22%3A%222016-09-05%22%2C%22payment_type_id%22%3A%22-1%22%2C%22register_id%22%3A%22-1%22%2C%22shop_id%22%3A%225%22%7D&pannel_id=listing


ajax:1
no_cache:1473129016082
form_name:listing.refresh
ajax_listing:{"draw_all":false,"draw_tab_only":false,"name":"reports.register.listings.payments","request":false,"saved_search":{"start_date":"2016-09-05","end_date":"2016-09-05","payment_type_id":"-1","register_id":"-1","shop_id":"5"},"sort":"amount","sort_dir":"DESC","count":"105","page":1,"page_count":2,"tab":"single","display_search":true,"display_advanced":"1","page_size":"100","max_size":100,"page_controls":true,"is_child_list":false,"title":"Payments","type":"listing","deleted_rows":null,"user_search":true}
key_values:{"start_date":"2016-09-05","end_date":"2016-09-05","payment_type_id":"-1","register_id":"-1","shop_id":"5"}
pannel_id:listing
Name


Shop ID: 5, WB. 3, Bergen.

response is ajax. total is found in  { 'html': "..." }
*/
