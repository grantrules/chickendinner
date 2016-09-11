pug = require('pug');

var server = function (ls) {
    this.lightspeed = ls;
};

server.prototype.handle = function(req, res) {
    if (req.method == "GET") {
        console.log('get:'+ req.url.split('?').shift());
        switch (req.url.split('?').shift()) {
            case '/':
                this.return_page(res, 'templates/index.pug', {totals:this.lightspeed.totals});
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
                break;
            default:
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end("Doesn't exist, sorry bro");
                break;
        }
        
    }
    
};

server.prototype.return_page = function(res, template, data) {
    var html = pug.renderFile(template, data);
    console.log(html.length);
    res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': html.length, 'Connection': 'close'});
    res.end(html);
};

module.exports = server;