'use strict';

describe('Controller: MainController', function () {

  // load the controller's module
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sopheAuthorApp'));

  var returnValues = false;
  var returnError = false;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, LibraryService, $q) {
    this.scope = $rootScope.$new();
    this.controller = $controller;
    spyOn(LibraryService, 'load').andCallFake(function() {
      var deferred = $q.defer();
      if (returnError) {
        deferred.reject('There was an error');
      }
      else if (returnValues) {
        deferred.resolve([{id: 1, name: 'test'}]);
      }
      else {
        deferred.resolve([]);
      }
      return deferred.promise;
    });
  }));

  describe('numberOfPhenotypes', function() {
    it('should default to 0', function () {
      returnValues = false;
      returnError = false;
      this.MainController = this.controller('MainController', {
        $scope: this.scope
      });
      this.scope.$root.$digest();
      expect(this.scope.numberOfPhenotypes).toBe(0);
      expect(this.scope.errorGettingPhenotypes).toBe(false);
    });

    it('should get the value from the LibraryService', function () {
      returnValues = true;
      returnError = false;
      this.MainController = this.controller('MainController', {
        $scope: this.scope
      });
      this.scope.$root.$digest();
      expect(this.scope.numberOfPhenotypes).toBe(1);
      expect(this.scope.errorGettingPhenotypes).toBe(false);
    });

    it('should handle an error from the LibraryService', function () {
      returnError = true;
      this.MainController = this.controller('MainController', {
        $scope: this.scope
      });
      this.scope.$root.$digest();
      expect(this.scope.numberOfPhenotypes).toBe(0);
      expect(this.scope.errorGettingPhenotypes).toBe(true);
    });
  });
});
