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
var codeSystems = require('./services/routes/codeSystems');
var config = require('./services/routes/config');
var exporters = require('./services/routes/exporters');
var units = require('./services/routes/units');
// Set user routes 
var user = require('./services/routes/phekb_user'); 

// Set the images directory to be served as files 
app.use(express.static('public'));

module.exports = app;

app.use(logger('combined'));
app.use(express.static("" + __dirname + "/dist", {maxAge: 1}));

// parse application/json
// And add limit to how big requests can be. Saving image of canvas caused error when too big. 
app.use(bodyParser.json({limit: '50mb'}));


// Routing examples at: https://github.com/strongloop/express/tree/master/examples/route-separation
app.get('/', site.index);

app.get('/api/qdm/:type', elements.index);
app.get('/api/qdm/:type/:item/attributes', elements.attributes);

app.get('/api/fhir/:type', fhir.index);

app.get('/api/library', library.index);
app.get('/api/library/:id', library.details);
// Image view 
//app.get('/image/:id', library.image);

app.post('/api/library', library.add);
app.put('/api/library/:id', library.update);
app.delete('/api/library/:id', library.delete);

app.get('/api/valueset', valueSets.index);
app.get('/api/valueset/search=:search', valueSets.search);
app.get('/api/valueset/:id', valueSets.details);
app.get('/api/valueset/:id/members', valueSets.members);

app.get('/api/codesystem/:codesystem/version/:version/search=:search', codeSystems.search);

app.get('/api/config', config.index);
app.get('/api/config/exporters', config.exporters);

app.post('/api/export/:exporter', exporters.invoke);
app.get('/api/export/:id/status', exporters.status);
app.get('/api/export/:id', exporters.result);

app.get('/api/units', units.index);

//User api 
app.post('/api/login', user.login);
app.post('/api/logout', user.logout);
//app.post('/register', user.register);
app.post('/api/current-user', user.current_user);
app.post('/phekb-resource', user.phekb_resource);


app.listen(process.env.PORT || 8081);