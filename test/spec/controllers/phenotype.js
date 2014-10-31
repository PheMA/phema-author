'use strict';

describe('Controller: PhenotypeCtrl', function () {

  // load the controller's module
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('treeControl'));
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

  it('sorts the list of phenotypes it receives', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-categories.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([
      {name: 'Pheno 2'},
      {name: 'Pheno 1'}
    ]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.phenotypes.length).toEqual(2);
    expect(scope.phenotypes[0].name).toEqual('Pheno 1');
  }));

  it('sorts a list of QDM elements', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-categories.json').respond({
      results: {bindings: [
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#TEST2'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            categoryLabel: {
                type: "literal",
                value: "Test 2",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        },
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#TEST'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            categoryLabel: {
                type: "literal",
                value: "Test",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        }
      ]}});
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond({
      results: {bindings: [
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#st'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#TEST"
            },
            dataElementLabel: {
                type: "literal",
                value: "Substance, Tolerance",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        },
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#si'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#TEST"
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
    expect(scope.dataElements.length).toEqual(2);
    expect(scope.dataElements[0].name).toEqual('Test');
    expect(scope.dataElements[0].children.length).toEqual(2);
    expect(scope.dataElements[0].children[0].name).toEqual('Substance, Intolerance');
  }));

  it('sorts a list of logical operators', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-categories.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond({
      results: {bindings: [
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#or'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            logicalOperatorLabel: {
                type: "literal",
                value: "Or",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        },
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#and'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            logicalOperatorLabel: {
                type: "literal",
                value: "And",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        }
      ]}});
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.logicalOperators.length).toEqual(2);
    expect(scope.logicalOperators[0].name).toEqual('And');
  }));

  it('sorts a list of temporal operators', inject(function ($controller) {
    $httpBackend.whenGET('data/qdm-categories.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond({
      results: {bindings: [
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#sbs'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            temporalOperatorLabel: {
                type: "literal",
                value: "Start Before Start",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        },
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#sas'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            temporalOperatorLabel: {
                type: "literal",
                value: "Start After Start",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        }
      ]}});
    $httpBackend.whenGET('data/phenotypes.json').respond([]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.temporalOperators.length).toEqual(2);
    expect(scope.temporalOperators[0].name).toEqual('Start After Start');
  }));

  it('does not add an element if there is no canvas', inject(function ($compile, $controller) {
    $httpBackend.whenGET('data/qdm-categories.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    expect(scope.addWorkflowObject()).toEqual(null);
  }));

  it('adds an element to a default position', inject(function ($compile, $controller) {
    angular.element(document.body).append('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    var linkingFn = $compile('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    var element = linkingFn(scope);
    $httpBackend.whenGET('data/qdm-categories.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    var obj = scope.addWorkflowObject({element: {name: 'Test' }});
    expect(obj.getX()).toEqual(50);
    expect(obj.getY()).toEqual(50);
  }));

  it('adds an element with specified config', inject(function ($compile, $controller) {
    angular.element(document.body).append('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    var linkingFn = $compile('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    var element = linkingFn(scope);
    $httpBackend.whenGET('data/qdm-categories.json').respond([]);
    $httpBackend.whenGET('data/qdm-elements.json').respond([]);
    $httpBackend.whenGET('data/qdm-logicalOperators.json').respond([]);
    $httpBackend.whenGET('data/qdm-temporalOperators.json').respond([]);
    $httpBackend.whenGET('data/phenotypes.json').respond([]);
    var ctrl = $controller('PhenotypeCtrl', { $scope: scope });
    $httpBackend.flush();
    var obj = scope.addWorkflowObject({x: 100, y: 77, element: {name: 'Test' }});
    expect(obj.getX()).toEqual(100);
    expect(obj.getY()).toEqual(77);
  }));
});
