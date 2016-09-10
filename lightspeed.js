var merge = require('merge-descriptors');
var request = require('request');
var request = request.defaults({jar: true});

var lightspeed = function(_user, _pass) {
    this.user = _user;
    this.password = _pass;
    this.WILLIAMSBURG_ID = 5;
    this.BERGEN_ID = 3;
    this.totals = {};

};

lightspeed.prototype.handle = function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n'+this.totals[this.WILLIAMSBURG_ID]);
    
};

lightspeed.prototype.update_totals = function(ls) {
    this.login(ls);
}

lightspeed.prototype.callback_fetch_daily_payments_received = function(err, res, body) {
    console.log("daily payments received report received");
    
    var re_total = /Payments-Refunds.*?\$([\d\.]+)/;
    var re_shopid = /shop_id=(\d+)/;
    
    var total = res.body.match(re_total);
    var shop_id = res.body.match(re_shopid);
    
    //these are going to throw errors if they don't find anything..

    total = total[1];
    shop_id = shop_id[1];
    
    this.totals[shop_id] = total;

}

lightspeed.prototype.callback_login_confirm = function(err, res, body) {

    // todo: throw error here? shutdown?
    console.log("confirm login?");
    
    // should contain acct number, set to 0 if logged out
    if (parseInt(res.headers['x-ls-acct-id']) > 0) {
        console.log("yes. logged in");
        debugger; // fucks out of scope
        this.fetch_daily_payments_received(this.WILLIAMSBURG_ID);
        this.fetch_daily_payments_received(this.BERGEN_ID);

    }
    else {
        console.log("no. login failed. i guess we'll just try again later?");
    }
}

lightspeed.prototype.login = function(ls) {
// https://east27.merchantos.com/register.php
// post data: login_name=grant%40ridebrooklynny.com&login_password=xxxxx&form_name=login&cordova=0
    
    var lapp = function(err, res, body) {
        ls.callback_login_confirm(err, res, body);
    }
    merge(lapp,ls);
    
	request.post({
		url: 'https://east27.merchantos.com/register.php',
		form: {login_name: this.user, login_password: this.password, form_name: 'login', cordova: 0},
	}, lapp);
};

// date format: yyyy-mm-dd, store is store id
lightspeed.prototype.fetch_daily_payments_received = function(store, date) {
    date = date || (new Date()).toISOString().slice(0,10);
    var that = this;
    var lapp = function(err, res, body) {
        that.callback_fetch_daily_payments_received(err, res, body);
    }
    
    merge(lapp,that);
    
    console.log("checking store "+store+" for "+date);
    //!!!!!!!
    //date = "2016-09-09";
	request.get({
		url: 'https://east27.merchantos.com/ajax_forms.php',
        qs: {
            ajax:1,
            no_cache:1473492616824,
            form_name:"listing.refresh",
            ajax_listing:'{"draw_all":false,"draw_tab_only":false,"name":"reports.register.listings.payments","request":false,"saved_search":{"start_date":"2016-09-10","end_date":"2016-09-10","payment_type_id":"-1","register_id":"-1","shop_id":"3"},"sort":"amount","sort_dir":"DESC","count":"0","page":1,"page_count":0,"tab":"single","display_search":true,"display_advanced":"1","page_size":"100","max_size":100,"page_controls":true,"is_child_list":false,"title":"Payments","type":"listing","deleted_rows":null,"user_search":true}',
key_values:'{"start_date":"'+date+'","'+date+'":"2016-09-10","payment_type_id":"-1","register_id":"-1","shop_id":"'+store+'"}',
pannel_id:"listing",
        }
        /* // shit didn't work, url encoding was exactly what was above, not what this turns into a querystring
		qs: {
			ajax:1,
			no_cache:1473129016082,
			form_name:"listing.refresh",
			ajax_listing:{"draw_all":false,"draw_tab_only":false,"name":"reports.register.listings.payments","request":false,"saved_search":{"start_date":date,"end_date":date,"payment_type_id":"-1","register_id":"-1","shop_id":store},"sort":"amount","sort_dir":"DESC","count":"105","page":1,"page_count":2,"tab":"single","display_search":true,"display_advanced":"1","page_size":"100","max_size":100,"page_controls":true,"is_child_list":false,"title":"Payments","type":"listing","deleted_rows":null,"user_search":true},
			key_values:{"start_date":this.date,"end_date":this.date,"payment_type_id":"-1","register_id":"-1","shop_id":store},
			pannel_id:"listing",
		}
        */
    }, lapp);
	//}).on('response', lapp);
};

lightspeed.prototype.close = function() {

};


module.exports = lightspeed;
