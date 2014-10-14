'use strict';

describe('Controller: PhenotypeCtrl', function () {

  // load the controller's module
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sopheAuthorApp'));

  var PhenotypeCtrl,
    scope, routeParams, $http, $httpBackend;

  // Setup http mocks
  beforeEach(inject(function (_$http_, _$httpBackend_){
    $http = _$http_;
    $httpBackend = _$httpBackend_;
  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    routeParams = {};
    PhenotypeCtrl = $controller('PhenotypeCtrl', {
      $scope: scope
    });
  }));

  it('should take an id in the route param', inject(function ($controller) {
    routeParams.id = 1;
    $controller('PhenotypeCtrl', {
      $scope: scope,
      $routeParams: routeParams
    });
    expect(scope.phenotype).toEqual(1);
  }));

  it('should be fine when there is no id in the route param', inject(function ($controller) {
    $controller('PhenotypeCtrl', {
      $scope: scope
    });
    expect(scope.phenotype).toEqual(undefined);
  }));

  it('loads a list of phenotypes', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([{name: 'Pheno'}]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.phenotypes.length).toEqual(1);
  }));

  it('sorts the list of phenotypes it receives', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([
      {name: 'Pheno 2'},
      {name: 'Pheno 1'}
    ]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.phenotypes.length).toEqual(2);
  }));

  it('loads a list of QDM elements', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-elements.json').respond({
      results: {bindings: [
        {
            datatypeLabel: {
                type: "literal",
                value: "Substance, Intolerance",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm-4-1"
            },
            dataElementLabel: {
                type: "literal",
                value: "Substance, Intolerance",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        }
      ]}});
    $httpBackend.whenGET('data/phenotypes.json').respond([]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.dataElements.length).toEqual(1);
  }));
});
