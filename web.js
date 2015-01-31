//var gzippo = require('gzippo');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var site = require('./services/routes/site');
var elements = require('./services/routes/dataElements');
var fhir = require('./services/routes/fhirElements');
var library = require('./services/routes/library');
var valueSets = require('./services/routes/valueSets');

module.exports = app;

app.use(logger());
app.use(express.static("" + __dirname + "/dist", {maxAge: 1}));

// parse application/json
app.use(bodyParser.json());

// Routing examples at: https://github.com/strongloop/express/tree/master/examples/route-separation
app.get('/', site.index);

app.get('/api/qdm/:type', elements.index);
app.get('/api/qdm/:type/:item/attributes', elements.attributes);

app.get('/api/fhir/:type', fhir.index);

app.get('/api/library', library.index);
app.get('/api/library/:id', library.details);
app.post('/api/library', library.add);
app.put('/api/library/:id', library.update);
app.del('/api/library/:id', library.delete);

app.get('/api/valueset', valueSets.index);
app.get('/api/valueset/search=:search', valueSets.search);
app.get('/api/valueset/:id', valueSets.details);
app.get('/api/valueset/:id/members', valueSets.members);


app.listen(process.env.PORT || 5000);