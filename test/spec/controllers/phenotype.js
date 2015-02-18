'use strict';
/* globals _ */


describe('Controller: PhenotypeController', function () {
  var Element = function(element) {
    this.elementDef = element;
  };
  Element.prototype.element = function() {
    if (typeof element === 'undefined') {
      return this.elementDef;
    }
    else {
      this.elementDef = element;
    }
  };


  // load the controller's module
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('treeControl'));
  beforeEach(module('sopheAuthorApp'));

  // Setup http mocks
  beforeEach(inject(function (_algorithmElementFactory_, _$httpBackend_, _LibraryService_){
    this.$httpBackend = _$httpBackend_;
    this.algorithmElementFactory = _algorithmElementFactory_;
    this.LibraryService = _LibraryService_;
    this.categoryGet = this.$httpBackend.when('GET', 'data/qdm-categories.json');
    this.categoryGet.respond({});
    this.elementsGet = this.$httpBackend.when('GET', 'data/qdm-elements.json');
    this.elementsGet.respond({});
    this.logicalOperatorsGet = this.$httpBackend.when('GET', 'data/qdm-logicalOperators.json');
    this.logicalOperatorsGet.respond({});
    this.temporalOperatorsGet = this.$httpBackend.when('GET', 'data/qdm-temporalOperators.json');
    this.temporalOperatorsGet.respond({});
    this.phenotypesGet = this.$httpBackend.when('GET', 'data/phenotypes.json');
    this.phenotypesGet.respond([]);
    this.phenotypeGet = this.$httpBackend.when('GET', /data\/phenotype\.json\.*/);
    this.phenotypeGet.respond({});
    this.fhirElementsGet = this.$httpBackend.when('GET', 'data/fhir-elements.json');
    this.fhirElementsGet.respond({});

    this.setupDirective = function($compile, $controller) {
      angular.element(document.body).append('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
      var linkingFn = $compile('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
      linkingFn(this.scope);
      this.controller = $controller('PhenotypeController', { $scope: this.scope });
      this.$httpBackend.flush();
    };
  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    this.scope = $rootScope.$new();
    this.routeParams = {};
    this.PhenotypeController = $controller('PhenotypeController', {
      $scope: this.scope
    });
    this.controller = null;
  }));

  describe('routes', function() {
    it('takes an id in the route param', inject(function ($controller) {
      this.routeParams.id = 1;
      $controller('PhenotypeController', {
        $scope: this.scope,
        $routeParams: this.routeParams
      });
      expect(this.scope.phenotype.id).toEqual(1);
    }));

    it('is fine when there is no id in the route param', inject(function ($controller) {
      $controller('PhenotypeController', {
        $scope: this.scope
      });
      expect(this.scope.phenotype).toEqual(undefined);
    }));
  });

  it('sorts the list of phenotypes it receives', inject(function () {
    this.phenotypesGet.respond([
      {name: 'Pheno 2'},
      {name: 'Pheno 1'}
    ]);
    this.$httpBackend.flush();
    expect(this.scope.phenotypes.length).toEqual(2);
    expect(this.scope.phenotypes[0].name).toEqual('Pheno 1');
  }));

  it('does not add an element if there is no canvas', inject(function () {
    this.$httpBackend.flush();
    expect(this.scope.addWorkflowObject()).toEqual(null);
  }));

  describe('save', function() {
    beforeEach(inject(function ($modal, $q, $compile, $controller) {
      this.setupDirective($compile, $controller);
      this.modalInstance = {
        result: {
          then: function(confirmCallback, cancelCallback) {
            //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
            this.confirmCallBack = confirmCallback;
            this.cancelCallback = cancelCallback;
          }
        },
        close: function( item ) {
          //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
          this.result.confirmCallBack( item );
        },
        dismiss: function( type ) {
          //The user clicked cancel on the modal dialog, call the stored cancel callback
          if (this.result.cancelCallback) { this.result.cancelCallback( type ); };
        }
      };
      spyOn($modal, 'open').andReturn(this.modalInstance);
      this.modal = $modal;

      spyOn(this.LibraryService, 'saveDetails').andCallFake(function() {
        var deferred = $q.defer();
        deferred.resolve('Result');
        return deferred.promise;
      });
    }));

    it('calls to save a new phenotype when ok clicked', function() {
      this.scope.save();
      this.modalInstance.close({test: 'item'});
      this.scope.$digest();
      expect(this.modal.open).toHaveBeenCalled();
      expect(this.LibraryService.saveDetails).toHaveBeenCalled();
      expect(this.scope.successMessage).toEqual('Your phenotype was successfully saved');
    });

    it('does not save a new phenotype when cancel clicked', function() {
      this.scope.save();
      this.modalInstance.dismiss();
      this.scope.$digest();
      expect(this.modal.open).toHaveBeenCalled();
      expect(this.LibraryService.saveDetails).not.toHaveBeenCalled();
      expect(this.scope.successMessage).toEqual(null);
    });

    it('does not show the save dialog for an existing phenotype', inject(function ($controller) {
      this.routeParams.id = 1;
      $controller('PhenotypeController', {
        $scope: this.scope,
        $routeParams: this.routeParams
      });
      this.scope.save();
      this.scope.$digest();
      this.modalInstance.dismiss();
      expect(this.modal.open).not.toHaveBeenCalled();
      expect(this.LibraryService.saveDetails).toHaveBeenCalled();
      expect(this.scope.successMessage).toEqual('Your phenotype was successfully saved');
    }));

    it('displays an error message when the save fails', inject(function($q) {
      this.LibraryService.saveDetails.andCallFake(function() {
        var deferred = $q.defer();
        deferred.reject('Error');
        return deferred.promise;
      });

      this.scope.save();
      this.modalInstance.close({test: 'item'});
      this.scope.$digest();
      expect(this.modal.open).toHaveBeenCalled();
      expect(this.LibraryService.saveDetails).toHaveBeenCalled();
      expect(this.scope.successMessage).toEqual(null);
      expect(this.scope.errorMessage).toEqual('There was an error trying to save your phenotype definition');
    }));
  });

  it('does not add an element if there is no canvas', inject(function () {
    this.$httpBackend.flush();
    expect(this.scope.addWorkflowObject()).toEqual(null);
  }));

  it('adds an element to a default position', inject(function ($compile, $controller) {
    this.setupDirective($compile, $controller);
    var obj = this.scope.addWorkflowObject({element: {name: 'Test' }});
    expect(obj.getX()).toEqual(50);
    expect(obj.getY()).toEqual(50);
  }));

  it('adds an element with specified config', inject(function ($compile, $controller) {
    this.setupDirective($compile, $controller);
    var obj = this.scope.addWorkflowObject({x: 100, y: 77, element: {name: 'Test' }});
    expect(obj.getX()).toEqual(100);
    expect(obj.getY()).toEqual(77);
  }));

  describe('can show properties', function() {
    beforeEach(inject(function($compile, $controller) {
      this.setupDirective($compile, $controller);
    }));

    it('allows properties for temporal operators', inject(function () {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'TemporalOperator'}));
      expect(this.scope.canShowProperties(null)).toEqual(true);
    }));

    it('allows properties for logical operators', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'LogicalOperator'}));
      expect(this.scope.canShowProperties(null)).toEqual(true);
    }));

    it('allows properties for categories', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'Category'}));
      expect(this.scope.canShowProperties(null)).toEqual(true);
    }));

    it('allows properties for data elements', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'DataElement'}));
      expect(this.scope.canShowProperties(null)).toEqual(true);
    }));

    it('allows properties for phenotypes', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'Phenotype'}));
      expect(this.scope.canShowProperties(null)).toEqual(true);
    }));

    it('allows properties for value sets', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'ValueSet'}));
      expect(this.scope.canShowProperties(null)).toEqual(true);
    }));

    it('does not allow properties for unknown items', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'UnknownOperator'}));
      expect(this.scope.canShowProperties(null)).toEqual(false);
    }));
  });

  describe('updates context menu visibility appropriately', function() {
    beforeEach(inject(function($compile, $controller) {
      this.setupDirective($compile, $controller);
    }));

    it('disables delete', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(null);
      this.scope.$root.$broadcast('sophe-element-selected');
      expect(_.findWhere(this.scope.buttons, {text: 'Delete'}).disabled).toEqual(true);
    }));

    it('enables delete', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'LogicalOperator'}));
      this.scope.$root.$broadcast('sophe-element-selected');
      expect(_.findWhere(this.scope.buttons, {text: 'Delete'}).disabled).toEqual(false);
    }));

    it('disables properties', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(null);
      this.scope.$root.$broadcast('sophe-element-selected');
      expect(this.scope.isPropertiesDisabled).toEqual(true);
    }));

    it('enables properties', inject(function() {
      spyOn(this.algorithmElementFactory, 'getFirstSelectedItem').andReturn(new Element({ type: 'LogicalOperator'}));
      this.scope.$root.$broadcast('sophe-element-selected');
      expect(this.scope.isPropertiesDisabled).toEqual(false);
    }));
  });
});
