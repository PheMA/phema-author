# phema-author
The PhEMA Authoring Tool (PHAT) is a graphical user interface to create phenotype algorithms based on the Quality Data Model (QDM).  This is developed as part of the Phenotype Execution and Modeling Architecture (PhEMA) project sponsored by NIGMS grant R01GM105688.


## About
PHAT is built using AngularJS 1.3 and leverages the KineticJS library for managing HTML5 canvas elements.
Many other libraries are in use - see bower.json for the full list.

The application is served from NodeJS, which also provides a few web services for PHAT's operations.

## Development Guidelines
Check that packages are up to date:
  `ncu`
  `ncu -m bower`

Following 
  `nsp check`
  `snyk test`
  or
  `snyk wizard`

## Deploy
To build the application for deployment, run:
  `grunt build-nomin --target=dev`

Currently the "build-nomin" task is used because minification does not create a working version of the code (fixing this is in progress).


## Running
When running in a prodution environment, ensure that stacktraces are not coming back when an exception is thrown.  There are many ways to manage this with systems like pm2, but at a minimum you can set the Node environment when running the app:
  `NODE_ENV=production node author.js`