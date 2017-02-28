var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require("connect-flash");
var helmet = require('helmet');
var auth = require('./services/lib/authentication');
var forceSSL = require('express-force-ssl');

// --------- CONFIGURATION ------
var defaultPort = (process.env.PORT || 8081);
var securePort = defaultPort + 100;

// --------- SERVICES -----------
// Services used to respond to route requests
var site = require('./services/routes/site');
var elements = require('./services/routes/dataElements');
var fhir = require('./services/routes/fhirElements');
var library = require('./services/routes/library');
var valueSets = require('./services/routes/valueSets');
var codeSystems = require('./services/routes/codeSystems');
var config = require('./services/routes/config');
var exporters = require('./services/routes/exporters');
var units = require('./services/routes/units');
var users = require('./services/routes/users');


// --------- SETUP -----------
var app = express();
module.exports = app;

// SSL setup
var sslOptions = {
  key: fs.readFileSync('../phema-dev.key'),
  cert: fs.readFileSync('../phema-dev.crt'),
  //ca: fs.readFileSync('../phema-dev-chain.pem')
};

app.use(logger('combined'));

// parse application/json
app.use(bodyParser.json());

// Allow flash message responses
app.use(flash());

// Initialize our authentication handler
auth.initialize(app);

// Use helmet to include recommended HTTP headers for security
app.use(helmet());

// Force SSL connections
app.use(forceSSL);
app.set('forceSSLOptions', {
  enable301Redirects: true,
  httpsPort: securePort
});


// --------- ROUTING -----------
// Routing examples at: https://github.com/strongloop/express/tree/master/examples/route-separation
//app.all('*', ensureSecure); // at top of routing calls

app.use(express.static("" + __dirname + "/dist", {maxAge: 1}));
app.get('/', site.index);

app.get('/api/qdm/:type', elements.index);
app.get('/api/qdm/:type/:item/attributes', elements.attributes);

app.get('/api/fhir/:type', fhir.index);

app.get('/api/library', library.index);
app.get('/api/library/:id', library.details);
app.post('/api/library', library.add);
app.put('/api/library/:id', library.update);
app.delete('/api/library/:id', library.delete);

app.get('/api/valueset', valueSets.index);
app.get('/api/valueset/search=:search', valueSets.search);
app.get('/api/valueset/:repo/:id', valueSets.details);
app.get('/api/valueset/:repo/:id/members', valueSets.members);
app.post('/api/valueset/:repo', valueSets.add);

app.get('/api/codesystem/:codesystem/version/:version/search=:search', codeSystems.search);

app.get('/api/config', config.index);

app.post('/api/export/:exporter', exporters.invoke);
app.get('/api/export/:id/status', exporters.status);
app.get('/api/export/:id', exporters.result);

app.get('/api/units', units.index);

app.get('/api/user/:id', users.details);
app.put('/api/user/:id', users.update);

app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.post('/register', users.add);

// Start up the application.  Note that we have both HTTP and HTTPS apps running.
http.createServer(app).listen(defaultPort);
https.createServer(sslOptions, app).listen(securePort);
