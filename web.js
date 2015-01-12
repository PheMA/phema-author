//var gzippo = require('gzippo');
var express = require('express');
var logger = require('morgan');
var app = express();
var site = require('./services/routes/site');
var elements = require('./services/routes/dataElements');

module.exports = app;

app.use(logger());
app.use(express.static("" + __dirname + "/dist", {maxAge: 1}));

// Routing examples at: https://github.com/strongloop/express/tree/master/examples/route-separation
app.get('/', site.index);
app.get('/api/qdm/:type', elements.index);
app.get('/api/qdm/:type/:item/attributes', elements.attributes);


app.listen(process.env.PORT || 5000);