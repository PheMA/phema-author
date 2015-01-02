'use strict';

describe('Factory: URLService', function () {

  beforeEach(module('sophe.services.url', 'sophe.config'));

  describe('real environment', function() {
    beforeEach(angular.mock.module('sopheAuthorApp', function($provide) {
      $provide.constant('environment', 'dev');
      $provide.constant('dataServiceBaseUrl', 'http://test.com/');
    }));

    beforeEach(inject(function (_URLService_) {
      this.URLService = _URLService_;
    }));

    it('getDataServiceUrl returns url for all attributes', function() {
      var url = this.URLService.getDataServiceURL('attributes');
      expect(url).toEqual('http://test.com/attributes');
    });
  });

  describe('local environment', function() {
    beforeEach(inject(function (_URLService_) {
      this.URLService = _URLService_;
    }));

    it('getDataServiceUrl returns a hardcoded data URL', function() {
      var url = this.URLService.getDataServiceURL('attributes');
      expect(url).toEqual('data/test-attribute_specificDatatype.json');
    });
  });
});