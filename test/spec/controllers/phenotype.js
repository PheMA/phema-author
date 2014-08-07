'use strict';

describe('Controller: PhenotypectrlCtrl', function () {

  // load the controller's module
  beforeEach(module('sopheAuthorApp'));

  var PhenotypectrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PhenotypectrlCtrl = $controller('PhenotypectrlCtrl', {
      $scope: scope
    });
  }));
});
