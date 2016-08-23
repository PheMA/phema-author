var request = require('request');
var async = require("async");
var ValueSetRepository = require('../lib/valueSets').ValueSetRepository;
var util = require('../lib/util');

// You can add as many CTS2 endpoints as you want
var VALUE_SET_SERVICES = [
    {'id': 'vsac', 'order': 1, 'title': 'NLM VSAC', 'repository' : new ValueSetRepository('http://umls_user:umls_pwd@localhost:8080/')}
  //, {'id': 'phema', 'order': 2, 'title': 'Local Value Sets', 'repository' : new ValueSetRepository('http://umls_user:umls_pwd@localhost:8080/')}
];

/**
 * Builds a collection of repositories to be invoked asynchronously.
 * @param {String} action The function to be called for each repository
 * @param {Array} actionParams The parameter(s) (if any) to be sent to the action function.  If no parameters are needed, this
 *    should be an empty Array ([]).
 *
 * @return {Object} An object representing the repositories to be invoked, keyed by the repository ID, and a value of a callback
 *   function for use by the async.js library.
 */
function buildRepositoryCollection(action, actionParams) {
  var repositories = {};
  VALUE_SET_SERVICES.forEach(function(item) {
    var repoFunction = item.repository[action];
    repositories[item.id] = function(callback) {
      var paramArray = actionParams.slice(0);  // We have to copy the array that's passed in, otherwise we get errors about the callback already being called.
      paramArray.push(function(error, data) { callback(error, {'title': item.title, 'order': item.order, 'data': data }); });
      repoFunction.apply(item.repository, paramArray);
    };
  });
  return repositories;
}

/**
 * Finds the configuration information for a value set repository, given a repository id
 * @param {String} id Identifier for the value set repository to locate.
 * @param {Object} res HTTP response object.
 *
 * @return Returns null if a unique value set repository is not found, and sets the appropriate
 *    error response and code in the response object parameter.
 *    Otherwise, it returns the repository object from the VALUE_SET_SERVICES collection.
 */
function findRepository(id, res) {
  var foundServices = VALUE_SET_SERVICES.filter(function(item) {
    return item.id === id;
  });
  if (foundServices.length != 1) {
    console.log('ERROR - there were ' + foundServices.length + ' results for repository id ' + id);
    res.status(400).send({'message' : 'Unable to find a value set service with id ' + id});
    return null;
  }

  return foundServices[0];
}

/**
 * List all value sets in each configured value set repository.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.index = function(req, res){
  var repositories = buildRepositoryCollection('getValueSets', []);
  async.parallel(repositories, 
    function (error, results) {
      util.respondJSON(res, error, results);
    }
  );
};

/**
 * Search for value sets with a given search string in their name.  This looks across all configured value
 * set repositories.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.search = function(req, res){
  var repositories = buildRepositoryCollection('searchValueSets', [req.params.search]);
  async.parallel(repositories, 
    function (error, results) {
      util.respondJSON(res, error, results);
    }
  );
};

/**
 * Finds a value set in a repository by its ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.details = function(req, res){
  console.log("GET - /api/valueSet/:repo/:id");
  var service = findRepository(req.params.repo, res);
  if (service == null) { return; }
  service.repository.getValueSet(req.params.id, function(error, data) {
    util.respondJSON(res, error, data);
  });
};

/**
 * Returns the codes of a value set, given a repository ID and the value set ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.members = function(req, res){
  console.log("GET - /api/valueSet/:repo/:id/members");
  var service = findRepository(req.params.repo, res);
  if (service == null) { return; }
  service.repository.getValueSetMembers(req.params.id, function(error, data) {
    util.respondJSON(res, error, data);
  });
};