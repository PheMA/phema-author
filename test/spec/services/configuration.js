'use strict';

describe('Factory: ConfigurationService', function () {

  beforeEach(module('sophe.services.configuration'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_ConfigurationService_, _$http_, _$httpBackend_) {
    this.ConfigurationService = _ConfigurationService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.allGet = this.$httpBackend.when('GET', 'data/config.json');
    this.allGet.respond({});
    this.exportersGet = this.$httpBackend.when('GET', 'data/config-exporters.json');
    this.exportersGet.respond([]);
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.ConfigurationService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));

    it('provides the full configuration', inject(function() {
      this.allGet.respond({
        exporters:
            [
              {name: 'Test 1', description: 'Test 1 description'},
              {name: 'Test 2', description: 'Test 2 description'}
            ]
      });

      var config = [];
      this.ConfigurationService.load()
        .then(function(conf) { config = conf; });
      this.$httpBackend.flush();
      expect(config.data.exporters.length).toEqual(2);
    }));
  });

  describe('loadExporters', function() {
    it('returns a promise', inject(function() {
      var promise = this.ConfigurationService.loadExporters();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));

    it('provides the exporters', inject(function() {
      this.exportersGet.respond(
        [
          {name: 'Test 1', description: 'Test 1 description'},
          {name: 'Test 2', description: 'Test 2 description'}
        ]
      );

      var exporters = [];
      this.ConfigurationService.loadExporters()
        .then(this.ConfigurationService.processExportersForMenu)
        .then(function(exp) { exporters = exp; });
      this.$httpBackend.flush();
      expect(exporters.length).toEqual(2);
      expect(exporters[0].text).toEqual('Test 1');
      expect(exporters[0].tooltip).toEqual('Test 1 description');
    }));
  });
});