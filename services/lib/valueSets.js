'use strict';
var request = require('request');
var FHIRRepository = require('./valueSet/fhir.js').FHIRValueSetRepository;
var CTS2Repository = require('./valueSet/cts2.js').CTS2ValueSetRepository;

const FHIR_REPOSITORY_TYPE = 'fhir';
const CTS2_REPOSITORY_TYPE = 'cts2';

// Provides a wrapper around multiple value set services.  Currently, support exists for CTS2 and FHIR.
// A consistent output format (based on CTS2) comes from this service, so that for all the value set
// services we map to, only one output format is needed.
//
// This was originally written to wrap CTS2 calls so we can safely invoke from our client without
// having to worry about cross-domain requests.  Given needs to expand the number of services supported,
// the purpose of this repository class has expanded.

// id - the identifier of the repository, used to distinguish it from other value sets
// repoType - the type of value set repository ('fhir' or 'cts2')
// baseURL - the base URL to the repository endpoint, including the trailing slash
// baseOID - OPTIONAL - only used for writable repositories.  This is the base OID used when creating new value set entries.
var ValueSetRepository = function(id, repoType, baseURL, baseOID) {
  console.log(baseURL);
  this.id = id;
  this.repoType = repoType.toLowerCase();
  this.baseURL = baseURL;
  this.baseOID = baseOID;
  this._repository = null;
};

// Determine if this value set repository has a valid configuration.  If not, it will call the specified
// callback with an error message.
ValueSetRepository.prototype._getRepository = function(callback) {
  if (this._repository) {
    return this._repository;
  }

  if (this.repoType === CTS2_REPOSITORY_TYPE) {
    this._repository = new CTS2Repository(this.id, this.baseURL, this.baseOID);
    return this._repository;
  }
  else if (this.repoType === FHIR_REPOSITORY_TYPE) {
    this._repository = new FHIRRepository(this.id, this.baseURL);
    return this._repository;
  }

  var error = 'The value set repository "' + this.id + '" is not correctly configured';
  console.log(error);
  if (callback) { callback({message: error}); }
  return null;
};

ValueSetRepository.prototype.getValueSets = function(callback) {
  var repo = this._getRepository(callback);
  if (!(repo)) { return; }
  repo.getValueSets(callback);
};

ValueSetRepository.prototype.searchValueSets = function(search, callback) {
  var repo = this._getRepository(callback);
  if (!(repo)) { return; }
  repo.searchValueSets(search, callback);
};

ValueSetRepository.prototype.getValueSet = function(id, callback) {
  var repo = this._getRepository(callback);
  if (!(repo)) { return; }
  repo.getValueSet(id, callback);
};

ValueSetRepository.prototype.getValueSetMembers = function(id, callback) {
  var repo = this._getRepository(callback);
  if (!(repo)) { return; }
  repo.getValueSetMembers(id, callback);
};

ValueSetRepository.prototype.add = function(data, callback) {
  var repo = this._getRepository(callback);
  if (!(repo)) { return; }
  repo.add(data, callback);
};

exports.ValueSetRepository = ValueSetRepository;