'use strict';

describe('Controller: AboutCtrl', function () {

  // load the controller's module
  beforeEach(module('sopheAuthorApp'));

  var AboutCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AboutCtrl = $controller('AboutCtrl', {
      $scope: scope
    });
  }));
});
