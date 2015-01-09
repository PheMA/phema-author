var request = require('request');
var http = require('http');

exports.index = function(req, res){
  //res.send('The API is accessible');

  request('http://23.22.63.122:8080/QDM2RDF/rest/qdm/categories', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.set('Content-Type', 'application/json');
      res.send(body) // Show the HTML for the Google homepage.
    }
    else {
      res.send(400, error);
    }
  });

  // var options = {
  //   host: '23.22.63.122',
  //   port: '8080',
  //   path: '/QDM2RDF/rest/qdm/categories',
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json; charset=utf-8',
  //   }
  // };

  // var serviceReq = http.request(options, function(serviceRes) {
  //   var msg = '';

  //   serviceReq.setEncoding('utf8');
  //   serviceReq.on('data', function(chunk) {
  //     msg += chunk;
  //   });
  //   serviceReq.on('end', function() {
  //     console.log(JSON.parse(msg));
  //   });
  // });

  // serviceReq.end();
};
