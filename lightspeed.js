var request = require('request');
var request = request.defaults({jar: true});

var lightspeed = function(_user, _pass) {
  this.user = _user;
  this.password = _pass;
  this.WILLIAMSBURG_ID = 5;
  this.BERGEN_ID = 3;
};

lightspeed.prototype.login = function() {
// https://east27.merchantos.com/register.php
// post data: login_name=grant%40ridebrooklynny.com&login_password=xxxxx&form_name=login&cordova=0
	request.post({
		url: 'https://east27.merchantos.com/register.php',
		formData: {login_name: this.user, login_password: this.password, form_name: 'login', cordova: 0},
	});
};

// date format: yyyy-mm-dd, store is store id
lightspeed.prototype.fetch_daily_payments_received = function(date, store) {
	request.get({
		url: 'https://east27.merchantos.com/ajax_forms.php',
		qs: {
			ajax:1,
			no_cache:1473129016082,
			form_name:"listing.refresh",
			ajax_listing:{"draw_all":false,"draw_tab_only":false,"name":"reports.register.listings.payments","request":false,"saved_search":{"start_date":this.date,"end_date":this.date,"payment_type_id":"-1","register_id":"-1","shop_id":store},"sort":"amount","sort_dir":"DESC","count":"105","page":1,"page_count":2,"tab":"single","display_search":true,"display_advanced":"1","page_size":"100","max_size":100,"page_controls":true,"is_child_list":false,"title":"Payments","type":"listing","deleted_rows":null,"user_search":true},
			key_values:{"start_date":this.date,"end_date":this.date,"payment_type_id":"-1","register_id":"-1","shop_id":store},
			pannel_id:"listing",
		}
	}).on('response', function(res) {
		// DOOT DOOT DOOT

	});
};

lightspeed.prototype.close = function() {

};


module.exports = lightspeed;
