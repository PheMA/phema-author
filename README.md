# phema-author
The PhEMA Authoring Tool (PHAT) is a graphical user interface to create phenotype algorithms based on the Quality Data Model (QDM).  This is developed as part of the Phenotype Execution and Modeling Architecture (PhEMA) project sponsored by NIGMS grant R01GM105688.

[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/lrasmus/phema-authoring-tool)

## Topics
[About](#about)
[Development Guidelines](#development-guidelines)
[Configuration](#configuration)
[Building the Code](#building-the-code)
[Running](#running)

## About
PHAT is built using AngularJS 1.3 and leverages the KineticJS library for managing HTML5 canvas elements.
Many other libraries are in use - see [bower.json](bower.json) for the full list.

The application is served from NodeJS, which also provides a few web services for PHAT's operations.


## Configuration
### Web application (AngularJS)
The web application has several configuration options in the `config/ `directory.  There are pre-configured files that you may use, such as for local testing (used for development), standalone instances (an instance of the authoring tool that runs outside of any other application) and PheKB instances (integrated with PheKB).

The values in these configuration entries are injected into the code when you build the application for deployment (see [Building the Code](#building-the-code) below).  If you wish to add new configuration entries, in addition to the config files themselves, you will need to modify `Gruntfile.js` to match and replace your new entries.

| Variable | Description |
|----------|-------------|
| environment| Usually the name of the file, it specifies the environment that is running.  You may add new files with their own environment, but please know that 'phekb' and 'local' have specific meanings within PHAT|
| dataServiceBaseUrl | [DEPRECATED] The base url (e.g., api/qdm/) with trailing backslash that is used to construct API calls to get QDM data elements. |
| fhirServiceBaseUrl | The base url (e.g., api/fhir/) with trailing backslash that is used to construct API calls to get FHIR data elements. |
| cqlServiceBaseUrl | The base url (e.g., api/cql/) with trailing backslash that is used to construct API calls to get CQL logical elements. |
| libraryBaseUrl | The base url (e.g., api/library/) with trailing backslash that is used to construct API calls to get items from the phenotype library. |
| valueSetServiceBaseUrl | The base url (e.g., api/valueset/) with trailing backslash that is used to construct API calls to get value set entries. |
| codeSystemServiceBaseUrl | The base url (e.g., api/codesystem/) with trailing backslash that is used to construct API calls to get medical vocabulary/code set entries. |
| configServiceBaseUrl | The base url (e.g., api/config/) with trailing backslash that is used to construct API calls to get application configuration information. |
| exporterServiceBaseUrl | The base url (e.g., api/export/) with trailing backslash that is used to construct API calls to get details about available exporters. |
| unitServiceBaseUrl | The base url (e.g., api/units/) with trailing backslash that is used to construct API calls to get units of measurement. |
| userServiceBaseUrl | The base url (e.g., api/user/) with trailing backslash that is used to construct API calls to manage users and authentication. |
| authenticationType | The authentication mode that is used.  You may add your own, but currently the system supports `none`, `local` and `phekb` |
| dashboardController | The name of the controller to use for displaying the dashboard page. |
| dashboardView | The path of the view (HTML file) to use for the dashboard page. |
| recaptchaKey | The reCAPTCHA key that is to be embedded in your HTML. |

### Services (Node.js)
In addition to the web application, there are some server-side configurations that can be made to control how the underlying web services work.

PHAT uses [dotenv](https://github.com/motdotla/dotenv) to manage server-side configuration and secrets.  There is a [dotenv-template](dotenv-template) to get you started.

In addigion, at the top of [author.js](author.js) there are three module configurations that may be changed (`library`, `users`, and `auth`).  Currently these may be set to either `phema` (the default for standalone operations) or `phekb`.  This controlls where the services look for the phenotype library, the list of users and authentication handling, respectively.

| Variable | Description |
|----------|-------------|
|MODULE_LIBRARY|Which library to configure with this instance (phema or phekb)|
|MODULE_USERS|Which user repository to use with this instance (phema or phekb)|
|MODULE_AUTH|Which authentication system to use with this instance (phema or phekb)|
|CODE\_SYSTEM\_SERVICE\_URL| The CTS2-compliant terminology service, e.g. https://lexevscts2.nci.nih.gov/lexevscts2/|
|QDM\_DER\_SERVICE\_URL|Data Element Repository base URL, e.g. http://projectphema.org:8080/DER/rest/qdm|
|FHIR\_DER\_SERVICE\_URL|Data Element Repository base URL, e.g. http://projectphema.org:8080/DER/rest/fhir|
|VSAC\_VALUE\_SET\_SERVICE_URL|CTS2-compliant VSAC wrapper service URL, e.g. http://umls_user:umls_pwd@localhost:8080/|
|PHEMA\_VALUE\_SET\_SERVICE_URL|CTS2-compliant value set service URL, e.g. http://172.16.51.130:8080/value-sets/|
|PHEMA\_VALUE\_SET\_OID|OID to associate with value sets created, e.g. 2.16.840.1.113883.3.1427.10000)|
|PHEKB\_URL|Only needed for PheKB integration.  Base URL of PheKB instance, e.g. https://phekb.org|
|PHEKB\_API\_KEY|Only needed for PheKB integration.  Secret key for PheKB API, e.g. testkey|
|PHEKB_LIBRARY_DB_URL|Only needed for PheKB integration.  URL of MongoDB instance to connect to, e.g. mongodb://localhost/phema-library|
|PHEKB\_USER\_DB\_URL|Only needed for PheKB integration.  URL of MongoDB instance to connect to, e.g. mongodb://localhost/phema-user|
|PHEMA\_LIBRARY\_URL|Only needed if connected to a PhEMA library instance.  URL of the library e.g. http://localhost:8082|
|PHEMA\_USER\_DB\_URL|Only needed if using local authentication.  URL of MongoDB instance to connect to, e.g. mongodb://localhost/phema-author|
|PHEMA\_USER\_JWT\_SECRET|Only needed if using local authentication.  JWT secret key, e.g. somesecret|
|EXPORTER\_DB\_URL|The MongoDB URL that the exporter can access, e.g. mongodb://localhost/phema-author|
|EXPORTER\_INPUT\_DIRECTORY|A folder on the server that the exporter can use for processing input, e.g. /opt/phema-hqmf-generator/temp/input/|
|EXPORTER\_OUTPUT\_DIRECTORY|A folder on the server that the exporter can use for delivering its output, e.g. /opt/phema-hqmf-generator/temp/input/|
|HQMF\_EXPORTER\_INVOKE\_PATH|Parameterized command that will invoke the exporter, e.g. 'BUNDLE_GEMFILE=/opt/phema-hqmf-generator/Gemfile bundle exec rake -f /opt/phema-hqmf-generator/lib/tasks/phema.rake phema:generate[{input},{output},hqmf,true]'|
|HDS\_JSON\_EXPORTER\_INVOKE\_PATH|Parameterized command that will invoke the health-data-standards JSON exporter, e.g. 'BUNDLE_GEMFILE=/opt/phema-hqmf-generator/Gemfile bundle exec rake -f /opt/phema-hqmf-generator/lib/tasks/phema.rake phema:generate[{input},{output},hds,true]'|
|SENDGRID\_API\_KEY|A [SendGrid](https://sendgrid.com/) API key.  This is only needed if PHAT is configured for local authentication, and will allow PHAT to send password reset e-mails.|
|PASSWORD\_RESET\_EMAIL|This is only needed if PHAT is configured for local authentication, and will be the e-mail address that password reset requests originate from|
|PHEMA_ENCRYPTION_KEY|Random 32 bytes represented as a hex string.  This can be generated as: `openssl rand -hex 32`.  e.g., 53ca0cb61b251e29f22d0698d27113fcaca814aac3261142bae4d5e7567f6263|

In [author.js](author.js) there are also configuration changes that may be made for ports and SSL.  By default the application will start two services, one on port 8081 (HTTP) and one on 8181 (HTTPS).  The intent of the HTTP instance is just to redirect to HTTPS.  The `sslOptions` setting controls the key and cert files to use for your SSL setup.  The list of ciphers may be modified, but it has been curated to include HTTPS protocols with no known vulnerabilities.

In configuration.js, you may specify basic configurations for your exporters and value set services, and how they will be labeled/displayed in PHAT.  Typically these don't need any changes.  The contents of configuration.js are returned to the web application, so you should not include any server-specific details that you don't want exposed.  Additional configuration for how exporters work, connection information for the value set repositories, and other services is in their respective file in `services/routes`.

Configuration specific to running the application as integrated with PheKB can be found in config/phekb.json.  Here you can specify the base URL of your PheKB instance, as well as the API key that PheKB uses to communicate with the authoring tool.


## Setup
Once you have the code, you will need to install dependencies.  This requires node, npm, compass and bower to be installed on your system.  You can then run:   
  `npm install`
  
  `bower install`


## Running locally (without NodeJS)
To run the application locally using grunt, you can simply run:   

  `grunt serve`
  
This will prepare the application and open up a browser at http://localhost:9001.  When you are presented with a login, you can simply click the "Log In" button in the upper right corner of the toolbar (this bypasses other authentication methods).  When running as a local development build, changes to your code files should be detected by grunt and the application automatically refreshed to account for those.  Some changes, such as to HTML templates, may not be detected and require a manual refresh.

The local development mode uses static JSON files for its data, instead of making calls to the NodeJS services.


## Building and running in NodeJS
To build the application for deployment, run:   
  `grunt build-nomin --target=dev`

A target of `dev` will build the code to run as a standalone application.  A target of `phekb` will build the code to run within PheKB.

Currently the "build-nomin" task is used because minification does not create a working version of the code (fixing this is in progress).

Once the application is successfully built, you can start it by running:   
  `node author.js`


## Development Guidelines
When you are ready to check in code or to do a release, please first check that your npm and bower packages are up to date:   
  `ncu`   
  `ncu -m bower`   

Following that, perform security checks to ensure there are no known vulnerabilities present:   
  `npm audit`   
  `snyk test`   
  or   
  `snyk wizard`


## Running
When running in a prodution environment, ensure that stacktraces are not coming back when an exception is thrown.  There are many ways to manage this with systems like pm2, but at a minimum you can set the Node environment when running the app:
  `NODE_ENV=production node author.js`
