'use strict';

describe('Factory: ExporterService', function () {

  beforeEach(module('sophe.services.exporter'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_ExporterService_, _$http_, _$httpBackend_) {
    this.ExporterService = _ExporterService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.runPost = this.$httpBackend.when('GET', 'data/exporter-run.json');
    this.runPost.respond({});
    this.resultGet = this.$httpBackend.when('GET', 'data/exporter-result.json');
    this.resultGet.respond([]);
    this.statusGet = this.$httpBackend.when('GET', 'data/exporter-status.json');
    this.statusGet.respond([]);
  }));

  describe('run', function() {
    it('returns a promise', inject(function() {
      var promise = this.ExporterService.run();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('getStatus', function() {
    it('returns a promise', inject(function() {
      var promise = this.ExporterService.getStatus();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('getResult', function() {
    it('returns a promise', inject(function() {
      var promise = this.ExporterService.getResult();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });
});