'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sopheAuthorApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should know the number of phenotypes', function () {
    expect(scope.numberOfPhenotypes).toBe(0);
  });

  it('should know if there are phenotypes', function () {
    expect(scope.hasPhenotypes()).toBe(false);
  });
});
