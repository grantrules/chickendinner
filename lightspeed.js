var merge = require('merge-descriptors');
var request = require('request');
var request = request.defaults({jar: true});
var Promise = require('promise');
var Queue = require('./promise-queue');
//const pug = require('pug');

var lightspeed = function(_user, _pass) {
    this.user = _user;
    this.password = _pass;
    this.WILLIAMSBURG_ID = 5;
    this.BERGEN_ID = 3;
    this.totals = {};
    this.queue = new Queue(1,10);
    //this.queue = new simplequeue();

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
    if (shop_id == null || total == null) {
        console.log(res.body);
        console.log('no matches but logged in, look up');
        return;
    }
    shop_id = shop_id[1];
    total = total[1];
    
    this.totals[shop_id] = total;

}

lightspeed.prototype.callback_login_confirm = function(res) {

    // todo: throw error here? shutdown?
    console.log("confirm login?");
    
    // should contain acct number, set to 0 if logged out
    if (parseInt(res.headers['x-ls-acct-id']) > 0) {
        console.log("yes. logged in");
        //return true;
        //debugger; // fucks out of scope

        var self = this;
        
        console.log(this.queue);
        
        this.queue.add(function() {
            return self.fetch_daily_payments_received(self.WILLIAMSBURG_ID);
        });
        this.queue.add(function() {
            return self.fetch_daily_payments_received(self.BERGEN_ID);
        });
        this.queue.done(function(erp){console.log('what');});

    }
    else {
        console.log("no. login failed. i guess we'll just try again later?");
        return false;
    }
}


lightspeed.prototype.login = function(ls) {
// https://east27.merchantos.com/register.php
// post data: login_name=grant%40ridebrooklynny.com&login_password=xxxxx&form_name=login&cordova=0
    
    var that = this;
    var lapp = function(res) {
        that.callback_login_confirm(res);
    }
    
    merge(lapp,that);
    
    var v = new Promise(function (fulfill, reject){

        request.post({
            url: 'https://east27.merchantos.com/register.php',
            form: {login_name: that.user, login_password: that.password, form_name: 'login', cordova: 0},
        }, function (err, res, body) {
              //console.log(res);
            console.log('doot');
              if (err) reject(err);
            else fulfill(res);
        });
    });
    
    
    
    

    var loggedin = v.then(lapp);
    console.log(loggedin);

    
    /*
    if (loggedin) {
        console.log("fetching updates");
        
    }
    */
    console.log(v);
};

// date format: yyyy-mm-dd, store is store id
lightspeed.prototype.fetch_daily_payments_received = function(store, date) {
    var p = new Promise(function (fulfill, reject) {
        
    });
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
            ajax_listing:'{"draw_all":false,"draw_tab_only":false,"name":"reports.register.listings.payments","request":false,"saved_search":{"start_date":"'+date+'","end_date":"'+date+'","payment_type_id":"-1","register_id":"-1","shop_id":"'+store+'"},"sort":"amount","sort_dir":"DESC","count":"0","page":1,"page_count":0,"tab":"single","display_search":true,"display_advanced":"1","page_size":"100","max_size":100,"page_controls":true,"is_child_list":false,"title":"Payments","type":"listing","deleted_rows":null,"user_search":true}',
key_values:'{"start_date":"'+date+'","end_date":"'+date+'","payment_type_id":"-1","register_id":"-1","shop_id":"'+store+'"}',
pannel_id:"listing",
        }
    }, lapp);
};

lightspeed.prototype.close = function() {

};


module.exports = lightspeed;
