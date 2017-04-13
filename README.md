# phema-author
The PhEMA Authoring Tool (PHAT) is a graphical user interface to create phenotype algorithms based on the Quality Data Model (QDM).  This is developed as part of the Phenotype Execution and Modeling Architecture (PhEMA) project sponsored by NIGMS grant R01GM105688.


## About
PHAT is built using AngularJS 1.3 and leverages the KineticJS library for managing HTML5 canvas elements.
Many other libraries are in use - see bower.json for the full list.

The application is served from NodeJS, which also provides a few web services for PHAT's operations.


## Setup
Once you have the code, you will need to install dependencies.  This requires node, npm, compass and bower to be installed on your system.  You can then run:
  `npm install`   
  `bower install`   


## Running locally (without NodeJS)
To run the application locally using grunt, you can simply run:
  `grunt serve`
This will prepare the application and open up a browser at http://localhost:9001.  If you are presented with a login, you can simply click the "Log In" button in the upper right corner of the toolbar (this bypasses other authentication methods).  When running as a local development build, changes to your code files should be detected by grunt and the application automatically refreshed to account for those.  Some changes, such as to HTML templates, may not be detected and require a manual refresh.

The local development mode uses static JSON files for its data, instead of making calls to the NodeJS services.


## Building and running in NodeJS
To build the application for deployment, run:
  `grunt build-nomin --target=dev`

Currently the "build-nomin" task is used because minification does not create a working version of the code (fixing this is in progress).

Once the application is successfully built, you can start it by running:
  `node author.js`


## Development Guidelines
When you are ready to check in code or to do a release, please first check that your npm and bower packages are up to date:
  `ncu`   
  `ncu -m bower`   

Following that, perform security checks to ensure there are no known vulnerabilities present:
  `nsp check`   
  `snyk test`   
  or
  `snyk wizard`


## Running
When running in a prodution environment, ensure that stacktraces are not coming back when an exception is thrown.  There are many ways to manage this with systems like pm2, but at a minimum you can set the Node environment when running the app:
  `NODE_ENV=production node author.js`