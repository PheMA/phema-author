'use strict';

describe('Controller: MainController', function () {

  // load the controller's module
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sopheAuthorApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    this.scope = $rootScope.$new();
    this.MainController = $controller('MainController', {
      $scope: this.scope
    });
  }));

  it('should know the number of phenotypes', function () {
    expect(this.scope.numberOfPhenotypes).toBe(0);
  });

  it('should know if there are phenotypes', function () {
    expect(this.scope.hasPhenotypes()).toBe(false);
  });
});
