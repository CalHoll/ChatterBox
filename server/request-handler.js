/*************************************************************
You should implement your request handler function in this file. requestHandler is already getting passed to http.createServer() in basic-server.js, but it won't work as is. You'll have to figure out a way to export this function from this file and include it in basic-server.js so that it actually works. *Hint* Check out the node module documentation at http://nodejs.org/api/modules.HTML. <= broken https://nodejs.org/api/http.html
**************************************************************/
// var results = [{
//   'username': 'jeff',
//   'message': 'hi'
// }];
var storage = [];
var ObjectId = 1;

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'JSON'
};

// var fs = require('fs'); // <= Added   https://nodejs.org/api/fs.html

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  // They include information about both the incoming request, such as headers and URL, and about the outgoing response, such as its status and content.

  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging. Adding more logging to your server can be an easy way to get passive debugging help, but you should always be careful about leaving stray console.logs in your code.
  // console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // console.log(JSON.stringify(request, null, 2));

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.

  /*Tell the client we are sending them plain text. You will need to change this if you are sending something other than plain text, like JSON or HTML.*/

  /* .writeHead() writes to the request line and headers of the response, which includes the status and all headers.*/
  // response.writeHead(statusCode, headers);

  var method = request.method;
  var url = request.url;

  var responseBody = {
    headers: headers,
    method: method,
    url: url,
    results: storage
  };

  if (request.url === '/classes/messages') {  //  /classes/room

    if (request.method === 'GET') {
      response.writeHead(200, headers);
      response.end(JSON.stringify(responseBody));
    }

    if (request.method === 'POST') {
      request.on('data', function(message) {
        var message = JSON.parse(message);
        response.writeHead(201, headers);
        storage.push(message);
      });
      request.on('end', function() {
        response.end("SUCCESsFULL SUCCESS!");
      });
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(200, headers);
      response.end(JSON.stringify(responseBody));
    }
  } else {
    response.writeHead(404, headers);
    response.end(JSON.stringify(responseBody));
  }

  /* Make sure to always call response.end() - Node may not send anything back to the client until you do. The string you pass to
  response.end() will be the body of the response - i.e. what shows up in the browser. Calling .end "flushes" the response's internal buffer, forcing node to actually send all the data over to the client. */

  // console.log("the returning response is: " + JSON.stringify(responseBody,null,2));
  // response.end(JSON.stringify(responseBody));
};

// These headers will allow Cross-Origin Resource Sharing (CORS). This code allows this server to talk to websites that
// are on different domains, for instance, your chat client. Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain. Another way to get around this restriction is to serve you chat client from this domain by setting // up static file serving.

exports.requestHandler = requestHandler;
