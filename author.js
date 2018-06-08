'use strict';
require('dotenv').config();

///////////////////////////////////////////////////////////////////////////////
//  Module Configuration - allows you to specify in which mode the different
//                         PhEMA modules should work.  Set this in your .env
///////////////////////////////////////////////////////////////////////////////
var moduleConfig = {
  library:  process.env.MODULE_LIBRARY || 'phema',   // phema | phekb
  users:    process.env.USERS_LIBRARY  || 'phema',   // phema | phekb
  auth:     process.env.AUTH_LIBRARY   || 'phema'    // phema | phekb
};
///////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var helmet = require('helmet');
var auth = require('./services/lib/authentication/' + moduleConfig.auth + '-authentication');
var forceSSL = require('express-force-ssl');

// --------- CONFIGURATION ------
var defaultPort = (process.env.PORT || 8081);
var securePort = defaultPort + 100;

// --------- SERVICES -----------
// Services used to respond to route requests
var site = require('./services/routes/site');
var elements = require('./services/routes/dataElements');
var fhir = require('./services/routes/fhirElements');
var library = require('./services/routes/library/' + moduleConfig.library + '-library');
var valueSets = require('./services/routes/valueSets');
var codeSystems = require('./services/routes/codeSystems');
var config = require('./services/routes/config');
var exporters = require('./services/routes/exporters');
var units = require('./services/routes/units');
var users = require('./services/routes/security/' + moduleConfig.users + '-users');


// --------- SETUP -----------
var app = express();
module.exports = app;

// Use helmet to include recommended HTTP headers for security
app.use(helmet());
// Need to explicitly set CSP (not enabled by default)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"]
  }
}));

// SSL setup
var sslOptions = {
  key: fs.readFileSync('phema-dev.key'),
  cert: fs.readFileSync('phema-dev.crt'),
  //ca: fs.readFileSync('../phema-dev-chain.pem'),
  // Cipher list derived from:
  //  https://gist.github.com/collinsrj/e7faf14bb4f1d0a190a0
  //  With reference to: https://www.openssl.org/docs/man1.0.2/apps/ciphers.html#CIPHER-LIST-FORMAT
  //  and https://nodejs.org/api/tls.html#tls_modifying_the_default_tls_cipher_suite
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES256-SHA256',
    '!aNULL',
    '!eNULL',
    '!EXPORT',
    '!DES',
    '!RC4',
    '!MD5',
    '!PSK',
    '!SRP',
    '!CAMELLIA'
  ].join(':'),
  honorCipherOrder: true
};

app.use(logger('combined'));

// parse application/json
app.use(bodyParser.json({limit: '50mb'}));

// Allow flash message responses
app.use(flash());

// Initialize our authentication handler
auth.initialize(app);

// Force SSL connections
app.use(forceSSL);
app.set('forceSSLOptions', {
  enable301Redirects: true,
  httpsPort: securePort
});


// --------- ROUTING -----------
// Routing examples at: https://github.com/strongloop/express/tree/master/examples/route-separation
//app.all('*', ensureSecure); // at top of routing calls

app.use(express.static('' + __dirname + '/dist', {maxAge: 1}));
app.get('/', site.index);

app.get('/api/qdm/:type', elements.index);
app.get('/api/qdm/:type/:item/attributes', elements.attributes);

app.get('/api/fhir/:type', fhir.index);

app.get('/api/library', library.index);
app.get('/api/library/:id', library.details);
app.post('/api/library', library.add);
app.put('/api/library/:id', library.update);
app.delete('/api/library/:id', library.delete);
app.post('/api/library/:id/access', library.access);

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
app.post('/api/user/resources', users.resources);

app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.post('/register', users.add);

// Start up the application.  Note that we have both HTTP and HTTPS apps running.
http.createServer(app).listen(defaultPort);
https.createServer(sslOptions, app).listen(securePort);
