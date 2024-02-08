// Create web server

// Load http module
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var comments = require('./comments.json');

// Create server
http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);

    if (req.method === 'GET' && uri === '/comments') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(comments));
    } else if (req.method === 'POST' && uri === '/comments') {
        var body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {
            var comment = JSON.parse(body);
            comments.push(comment);
            fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function (err) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
            });
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(comments));
        });
    } else if (req.method === 'GET' && uri === '/bundle.js') {
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        fs.createReadStream('bundle.js').pipe(res);
    } else {
        fs.exists(filename, function (exists) {
            if (!exists) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) filename += '/index.html';

            fs.readFile(filename, 'binary', function (err, file) {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.write(err + '\n');
                    res.end();
                    return;
                }

                res.writeHead(200);
                res.write(file, 'binary');
                res.end();
            });
        });
    }
}).listen(8000);
console.log('Server running at http://localhost:8000/');