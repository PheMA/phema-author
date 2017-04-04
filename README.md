# phema-author
The PhEMA Authoring Tool (PHAT) is a graphical user interface to create phenotype algorithms based on the Quality Data Model (QDM).  This is developed as part of the Phenotype Execution and Modeling Architecture (PhEMA) project sponsored by NIGMS grant R01GM105688.

## Topics
[About](#about)
[Development Guidelines](#development-guidelines)
[Configuration](#configuration)
[Building the Code](#building-the-code)
[Running](#running)

## About
PHAT is built using AngularJS 1.3 and leverages the KineticJS library for managing HTML5 canvas elements.
Many other libraries are in use - see bower.json for the full list.

The application is served from NodeJS, which also provides a few web services for PHAT's operations.

## Development Guidelines
Check that packages are up to date:
```
ncu
ncu -m bower
```

Check for any known vulnerabilities
```
nsp check
snyk test
```


## Configuration
### Web application (AngularJS)
The web application has several configuration options in the `config/ `directory.  There are pre-configured files that you may use, such as for local testing (used for development), standalone instances (an instance of the authoring tool that runs outside of any other application) and PheKB instances (integrated with PheKB).

The values in these configuration entries are injected into the code when you build the application for deployment (see [Building the Code](#building-the-code) below).  If you wish to add new configuration entries, in addition to the config files themselves, you will need to modify `Gruntfile.js` to match and replace your new entries.

| Variable | Description |
|----------|-------------|
| environment| Usually the name of the file, it specifies the environment that is running.  You may add new files with their own environment, but please know that 'phekb' and 'local' have specific meanings within PHAT|
| dataServiceBaseUrl | The base url (e.g., api/qdm/) with trailing backslash that is used to construct API calls to get data elements. |
| fhirServiceBaseUrl | The base url (e.g., api/fhir/) with trailing backslash that is used to construct API calls to get FHIR data elements. | 
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

### Services (Node.js)
In addition to the web application, there are some server-side configurations that can be made to control how the underlying web services work.

In author.js, at the top there are three module configurations that may be changed (`library`, `users`, and `auth`).  Currently these may be set to either `phema` (the default for standalone operations) or `phekb`.  This controlls where the services look for the phenotype library, the list of users and authentication handling, respectively.

In author.js there are also configuration changes that may be made for ports and SSL.  By default the application will start two services, one on port 8081 (HTTP) and one on 8181 (HTTPS).  The intent of the HTTP instance is just to redirect to HTTPS.  The `sslOptions` setting controls the key and cert files to use for your SSL setup.  The list of ciphers may be modified, but it has been curated to include HTTPS protocols with no known vulnerabilities.

In configuration.js, you may specify basic configurations for your exporters and value set services.  The contents of configuration.js are returned to the web application, so you should not include any server-specific details that you don't want exposed.  Additional configuration for how exporters work, connection information for the value set repositories, and other services is in their respective file in `services/routes`.

Configuration specific to running the application as integrated with PheKB can be found in phekb-configuration.js.  Here you can specify the base URL of your PheKB instance, as well as the API key that PheKB uses to communicate with the authoring tool.

## Building the Code
To build the application for deployment, run:
  `grunt build-nomin --target=dev`

A target of `dev` will build the code to run as a standalone application.  A target of `phekb` will build the code to run within PheKB.

Currently the "build-nomin" task is used because minification does not create a working version of the code (fixing this is in progress).


## Running
When running in a prodution environment, ensure that stacktraces are not coming back when an exception is thrown.  There are many ways to manage this with systems like pm2, but at a minimum you can set the Node environment when running the app:
  `NODE_ENV=production node author.js`
