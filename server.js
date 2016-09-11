pug = require('pug');
later = require('later');

var server = function (ls) {
    this.lightspeed = ls;
    this.sessions = new Obect(); // allows delete to work
    this.timeout = 120 * 60000;
    this.session_name = "cdsession";
    this.session_cron = later.setInterval(function() { console.log("session cleanup.. "+this.sessions.length+" keys."); this.clean_sessions(); }, later.parse.recur().every(30).minute());
};

server.prototype.is_logged_in = function(req) {
    // cookies
    
};

server.prototype.is_active_session = function(key, now) {
    now = now || new Date(Date().now);
    return this.sessions.hasOwnProperty(key)
        && now - this.sessions[key] > this.timeout;
};

// run this as a schedule
server.prototype.clean_sessions = function() {
    var now = new Date(Date.now());
    // minutes
    for (var key in this.sessions) {
        if (!this.is_active_session(key, now)) {
            delete this.sessions[key];
        }
    }
};

server.prototype.handle = function(req, res) {
    if (req.method == "GET") {
        console.log('get:'+ req.url.split('?').shift());
        switch (req.url.split('?').shift()) {
            case '/':
                this.return_page(res, 'templates/index.pug', {totals:this.lightspeed.totals});
                break;
            case '/totals':
                this.return_page(res, 'templates/totals.pug', {totals:this.lightspeed.totals, loggedin:this.is_logged_in(req)}, {cookies: {}});
                break;
            default:
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end("Doesn't exist, sorry bro");
                break;
        }
    }
    else if (req.method == "POST") {
        console.log('post');

        switch (req.url) {
            case '/login':
                
                if (login) {
                    var session_key = this.new_session_key();
                    var date = new Date(Date().now);
                    this.sessions[session_key] = date;
                }
                break;
            default:
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end("Doesn't exist, sorry bro");
                break;
        }
        
    }
    
};

server.prototype.return_page = function(res, template, data) {
    var html = "";
    var contenttype = "text/html";
    if (template == "json") {
        html = JSON.stringify(data);
        contenttype = "application/json";
    } else {
        html = pug.renderFile(template, data);

    }
    console.log(html.length);
    res.writeHead(200, {'Content-Type': contenttype, 'Content-Length': html.length, 'Connection': 'close'});
    res.end(html);
};

module.exports = server;