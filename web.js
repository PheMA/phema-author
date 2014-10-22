//var gzippo = require('gzippo');
var express = require('express');
var logger = require('morgan');
var app = express();

app.use(logger());
app.use(express.static("" + __dirname + "/dist", {maxAge: 1}));
app.use('/*', function(req, res){
  res.sendfile(__dirname + '/dist/index.html');
});
//app.use(gzippo.staticGzip("" + __dirname + "/dist", {maxAge: 1}));
app.listen(process.env.PORT || 5000);