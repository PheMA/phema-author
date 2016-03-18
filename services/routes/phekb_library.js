//var gzippo = require('gzippo');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var library = require('./services/routes/library');

module.exports = app;

app.use(logger('combined'));

// parse application/json, allow large requests (required for saving image of phenotype )
app.use(bodyParser.json({limit: '50mb'}));

app.get('/library', library.index);
app.get('/library/repositories', library.repositories);
app.get('/library/:id', library.details);
app.post('/library', library.add);
app.put('/library/:id', library.update);
app.delete('/library/:id', library.delete);

app.listen(process.env.PORT || 8082);