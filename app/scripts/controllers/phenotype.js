'use strict';
/* globals ArrayUtil, findParentElementByName, ValueSet, _ */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypeController
 * @description
 * # PhenotypeController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeController', ['$scope', '$http', '$routeParams', '$modal', '$location', '$window', '$timeout', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', 'SubsetOperatorService', 'QDMElementService', 'FHIRElementService', 'LibraryService', 'ConfigurationService', function ($scope, $http, $routeParams, $modal, $location, $window, $timeout, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService, SubsetOperatorService, QDMElementService, FHIRElementService, LibraryService, ConfigurationService) {
    $scope.phenotype = ($routeParams.id ? {id: $routeParams.id } : null );
    $scope.status = { open: [false, false, false, false, false, false, false, false]};
    $scope.isPropertiesDisabled = true;
    $scope.successMessage = null;
    $scope.errorMessage = null;
    $scope.checkForUnsavedChanges = true;
    $scope.treeOptions = {
      dirSelectable: false
    };

    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) { $scope.phenotypes = elements; });

    FHIRElementService.load()
      .then(FHIRElementService.processValues)
      .then(function(elements) { $scope.fhirElements = elements; });

    QDMElementService.load()
      .then(QDMElementService.processValues)
      .then(function(elements) { $scope.dataElements = elements; });

    LogicalOperatorService.load()
      .then(LogicalOperatorService.processValues)
      .then(function(operators) { $scope.logicalOperators = operators; });

    TemporalOperatorService.load()
      .then(TemporalOperatorService.processValues)
      .then(function(operators) { $scope.temporalOperators = operators; });

    SubsetOperatorService.load()
      .then(SubsetOperatorService.processValues)
      .then(function(operators) { $scope.subsetOperators = operators; });

    // Update the phenotype metadata so that it is available within the phenotype definition
    // for export.  This needs to be synced each time we update/save.
    function _setPhenotypeData(id, name, description) {
      $scope.canvasDetails.kineticStageObj.mainLayer.setAttr("phenotypeData", {"id":id, "name":name, "description":description});
    }

    $scope.export = function() {
      var exporter = this;
      var modalInstance = $modal.open({
        templateUrl: 'views/phenotypes/export.html',
        controller: 'ExportPhenotypeController',
        size: 'md',
        resolve: {
          phenotype: function() {
            return $scope.canvasDetails.kineticStageObj.mainLayer.toJSON();
          },
          exporter: function() {
            return exporter;
          }
        }
      });

      // If the user selects a phenotype to load, redirect to that phenotype's ID which
      // will cause it to load properly.
      modalInstance.result.then(function () {
      });

      var hiddenElement = document.createElement('a');
      var blob = new Blob([$scope.canvasDetails.kineticStageObj.mainLayer.toJSON()],
      //var blob = new Blob([JSON.stringify(ExporterService.minimizeJsonFormat($scope.canvasDetails.kineticStageObj.mainLayer.toJSON()))],
        {type: 'text/json;charset=utf-8;'});
      var url = URL.createObjectURL(blob);
      document.body.appendChild(hiddenElement);
      hiddenElement.style.display = 'none';
      hiddenElement.href = url;
      hiddenElement.setAttribute('download', 'phenotype.json');
      hiddenElement.click();
      $window.URL.revokeObjectURL(url);
    };

    // Exporters that we create will be reformatted similar to menu items.
    ConfigurationService.loadExporters($scope.export)
      .then(ConfigurationService.processExportersForMenu)
      .then(function(exporters) { $scope.exporters = exporters; _.findWhere($scope.buttons, {text: 'Export'}).children = exporters; });

    // If a specific phenotype was specified, load it now
    if ($scope.phenotype) {
      // We can't load the phenotype until the canvas has been built, so we will watch
      // to see when that takes place before proceeding.
      $scope.$watch('canvasDetails', function() {
        if ($scope.canvasDetails) {
          LibraryService.loadDetails($scope.phenotype.id)
            .then(function(phenotype) {
              $scope.phenotype = phenotype;
              algorithmElementFactory.loadFromDefinition($scope, phenotype.definition);
            });
        }
      });
    }

    // Helper function to determine if a phenotype has been changed, either as a new
    // phenotype or an existing one loaded for editing.
    function _hasPhenotypeChanged() {
      // Make sure the canvas has been initialized, otherwise we know there is
      // nothing to save.
      if (!$scope.canvasDetails || !$scope.canvasDetails.kineticStageObj || !$scope.canvasDetails.kineticStageObj.mainLayer) {
        return false;
      }

      // Get the phenotype definition from the KineticJS stage.  We expect there to be
      // at least some information about the main layer, so if it is undefined this is
      // an unexpected condition.
      var phenotypeDefinition = $scope.canvasDetails.kineticStageObj.mainLayer.toJSON();
      if (!phenotypeDefinition) {
        console.error('The phenotype definition was blank, which is unexpected');
        return false;
      }

      // We need to parse the JSON so we can look for defined children elements in the
      // main layer.  This tells us if there is anything in the canvas.
      var phenotypeObject = JSON.parse(phenotypeDefinition);
      if ($scope.phenotype) {
        if ($scope.phenotype.definition !== phenotypeDefinition) {
          return true;
        }
      }
      else if (phenotypeObject.children && phenotypeObject.children.length > 0) {
        return true;
      }

      return false;
    }

    // Clear out the success and error message boxes that may be showing.
    function _resetMessages() {
      $scope.closeSuccessMessage();
      $scope.closeErrorMessage();
    }

    // Performs the actual save action - bringing up the save dialog.  This is
    // broken into a function so it can be passed and called in different places.
    function _handlePhenotypeSave(result) {
      LibraryService.saveDetails(result)
        .then(function(data) {
          _setPhenotypeData(data.id, data.name, data.description);
          $scope.successMessage = 'Your phenotype was successfully saved';
          $location.path('/phenotype/' + data.id);
          $timeout(_resetMessages, 5000); // Only timeout success
        }, function() {
          _setPhenotypeData("", result["name"], result["description"]);
          $scope.errorMessage = 'There was an error trying to save your phenotype definition';
        });
    }

    // Helper to ensure that the path can be changed without a potentially blocking
    // check to see if changes need to be saved.  Should be used only when we know we
    // can discard changes.
    function _forceNavigate(url) {
      $scope.checkForUnsavedChanges = false;
      $location.path(url);
    }

    // Performs the actual create new action - resetting the canvas.  This is
    // broken into a function so it can be passed and called in different places.
    function _handleNew() {
      // Be sure to clean everything up before we redirect, otherwise we have errant
      // objects in memory that cause problems.
      var stage = $scope.canvasDetails.kineticStageObj;
      var layer = stage.mainLayer;
      layer.get('Group').each(function(group) {
        algorithmElementFactory.destroyGroup(group);
      });

      _forceNavigate('/phenotype/');
    }

    // Displays a prompt if the user wants to save changes.  If so, it initiates the
    // save operation.  If not, it calls a function (fnAction with optional params)
    // to perform whatever action it had halted.
    function _handleAskToSave(fnAction, params) {
      var modalInstance = $modal.open({
        templateUrl: 'views/phenotypes/prompt.html',
        controller: 'PromptController',
        size: 'lg',
        resolve: {
          title: function() { return 'Save phenotype?'; },
          message: function() { return 'You have changes that haven\'t been saved.  Would you like to save your changes now?'; },
          buttons: function() { return ['Yes', 'No', 'Cancel']; }
        }
      });

      modalInstance.result.then(function (id) {
        if (id === 'Yes') {
          $scope.save();
        }
        else if (id === 'No') {
          fnAction(params);
        }
      });
    }

    // Performs the actual edit/losd action - opening the load dialog.  This is
    // broken into a function so it can be passed and called in different places.
    function _handleLoad() {
      var modalInstance = $modal.open({
        templateUrl: 'views/phenotypes/load.html',
        controller: 'LoadPhenotypeController',
        size: 'lg',
        resolve: {
          phenotypes: function() {
            return $scope.phenotypes;
          }
        }
      });

      // If the user selects a phenotype to load, redirect to that phenotype's ID which
      // will cause it to load properly.
      modalInstance.result.then(function (id) {
        // Be sure to clean everything up before we redirect, otherwise we have errant
        // objects in memory that cause problems.
        var stage = $scope.canvasDetails.kineticStageObj;
        var layer = stage.mainLayer;
        layer.get('Group').each(function(group) {
          algorithmElementFactory.destroyGroup(group);
        });

        $location.path('/phenotype/' + id);
      });
    }

    // Used in the tree control to filter out certain temporal operators
    var temporalFilterRegex = new RegExp('[a-z]+\\sConcurrent With', 'i');
    $scope.temporalFilter = function(item) {
      if (item) {
        return (item.name.search(temporalFilterRegex) === -1);
      }
    };

    // config object:
    //   x
    //   y
    //   element
    $scope.addWorkflowObject = function (config) {
      return algorithmElementFactory.addWorkflowObject(config, $scope);
    };

    $scope.copy = function() {
      console.log('Copy');
    };

    $scope.canDelete = function() {
      return (algorithmElementFactory.getFirstSelectedItem($scope) !== null);
    };

    $scope.delete = function() {
      algorithmElementFactory.deleteSelectedObjects($scope);
    };

    $scope.paste = function() {
      console.log('Paste');
    };

    $scope.closeSuccessMessage = function() {
      $scope.successMessage = null;
    };

    $scope.closeErrorMessage = function() {
      $scope.errorMessage = null;
    };

    $scope.save = function() {
      var phenotypeDefinition = $scope.canvasDetails.kineticStageObj.mainLayer.toJSON();

      // If the phenotype was already saved (because there is an ID) we don't need to display
      // the dialog again and we can just save.
      if ($scope.phenotype) {
        $scope.phenotype.definition = phenotypeDefinition;
        _handlePhenotypeSave($scope.phenotype);
      }
      else {
        var modalInstance = $modal.open({
          templateUrl: 'views/properties/phenotype.html',
          controller: 'PhenotypePropertiesController',
          size: 'lg',
          resolve: {
            phenotype: function() {
              return {definition: phenotypeDefinition };
            },
            isReference: function() { return false; }
          }
        });

        modalInstance.result.then(function (result) {
          _handlePhenotypeSave(result);
        });
      }
    };

    $scope.new = function() {
      if (_hasPhenotypeChanged()) {
        _handleAskToSave(_handleNew);
      }
      else {
        _handleNew();
      }
    };

    $scope.load = function() {
      if (_hasPhenotypeChanged()) {
        _handleAskToSave(_handleLoad);
      }
      else {
        _handleLoad();
      }
    };

    $scope.canShowProperties = function(item) {
      var selectedElement = item || algorithmElementFactory.getFirstSelectedItem($scope);
      if (!selectedElement || !selectedElement.element) {
        return false;
      }

      var element = selectedElement.element();
      return (element.type === 'TemporalOperator' ||
        element.type === 'LogicalOperator' ||
        element.type === 'Category' ||
        element.type === 'Phenotype' ||
        element.type === 'DataElement' ||
        element.type === 'ValueSet' ||
        element.type === 'SubsetOperator');
    };

    $scope.showProperties = function() {
      var selectedElement = algorithmElementFactory.getFirstSelectedItem($scope);
      if (!$scope.canShowProperties(selectedElement)) {
        return;
      }

      var modalInstance = null;
      var element = selectedElement.element();
      if (element.type === 'TemporalOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/relationship.html',
          controller: 'RelationshipPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            temporalOperators: function() {
              return $scope.temporalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          var uri = ((result.relationship.modifier) ? result.relationship.modifier.id : result.relationship.base.uri);
          element.uri = uri;
          element.name = ArrayUtil.findInArrayOrChildren($scope.temporalOperators, 'uri', uri).name;
          element.timeRange = result.timeRange;
          if (result.timeRange.comparison) {
            element.timeRange.comparison = result.timeRange.comparison.name;
          }
          selectedElement.element(element);
          var label = selectedElement.label();
          label.setText(element.name);
          label.getStage().draw();
        });
      }
      else if (element.type === 'LogicalOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/logicalOperator.html',
          controller: 'LogicalOperatorPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            containedElements: function () {
              return selectedElement.phemaObject().containedElements();
            },
            logicalOperators: function() {
              return $scope.logicalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          element = result;
          selectedElement.element(element);
          findParentElementByName(selectedElement, 'header').setText(element.name);
          selectedElement.getStage().draw();
        });
      }
      else if (element.type === 'Category' || element.type === 'DataElement') {
        // We define the element properties based on the URI (if it's QDM or FHIR)
        var isFHIR = (element.uri.indexOf('fhir') >= 0);
        modalInstance = $modal.open({
          templateUrl: (isFHIR ? 'views/properties/fhirElement.html' : 'views/properties/qdmElement.html'),
          controller: (isFHIR ? 'FHIRElementPropertiesController' : 'QDMElementPropertiesController'),
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            attributes: function () {
              return angular.copy(selectedElement.phemaObject().attributes());
            },
            valueSet: function() {
              if (selectedElement.phemaObject() && selectedElement.phemaObject().valueSet()) {
                return angular.copy(selectedElement.phemaObject().valueSet().element());
              }
              else {
                return null;
              }
            }
          }
        });

        modalInstance.result.then(function (result) {
          if (selectedElement.phemaObject() && selectedElement.phemaObject().attributes) {
            selectedElement.phemaObject().attributes(result.attributes);
          }
          else {
            element.attributes = result.attributes;
            selectedElement.element(element);
          }

          var createNewVS = false;
          var removeOldVS = false;
          var existingValueSet = null;
          if (selectedElement.phemaObject() &&
              selectedElement.phemaObject().valueSet() &&
              selectedElement.phemaObject().valueSet().element()) {
            existingValueSet = selectedElement.phemaObject().valueSet();
            if (existingValueSet.element().id !== result.valueSet.id) {
              createNewVS = true;
              removeOldVS = true;
            }
          }
          else if (result.valueSet && result.valueSet.id) {
            createNewVS = true;
          }

          if (removeOldVS) {
            // Remove the old element from the UI
            algorithmElementFactory.destroyGroup(existingValueSet);
            selectedElement.phemaObject().valueSet(null);
          }

          if (createNewVS) {
            var newValueSet = $scope.addWorkflowObject({x: 0, y: 0, element: result.valueSet});
            selectedElement.phemaObject().valueSet(newValueSet);
            if (result.valueSet.customList) {
              newValueSet.phemaObject().customList(result.valueSet.customList);
              delete result.valueSet.customList;
            }
            selectedElement.getStage().draw();
          }
        });
      }
      else if (element.type === 'Phenotype') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/phenotype.html',
          controller: 'PhenotypePropertiesController',
          size: 'lg',
          resolve: {
            phenotype: function () {
              return angular.copy(element);
            },
            isReference: function() { return true; }
          }
        });

        modalInstance.result.then(function (result) {
          element.name = result.name;
          element.description = result.description;
          selectedElement.element(element);
          findParentElementByName(selectedElement, 'header').setText(element.name);
          selectedElement.getStage().draw();
        });
      }
      else if (element.type === 'ValueSet') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/valueSet.html',
          controller: 'ValueSetPropertiesController',
          size: 'lg',
          resolve: {
            valueSet: function () {
              return angular.copy(element);
            },
            isReference: function() { return true; }
          }
        });
      }
      else if (element.type === 'SubsetOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/subsetOperator.html',
          controller: 'SubsetOperatorPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            containedElements: function () {
              return selectedElement.phemaObject().containedElements();
            },
            subsetOperators: function() {
              return $scope.subsetOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          element = result;
          selectedElement.element(element);
          findParentElementByName(selectedElement, 'header').setText(element.name);
          selectedElement.getStage().draw();
        });
      }
    };

    // Keep this after the other scope function definitions - it needs to have the appropriate definitions loaded
    // to associate with the buttons.
    $scope.buttons = [
      {id: 'btnNew', text: 'New', iconClass:'fa fa-plus', event: $scope.new, disabled: false, tooltip: 'Create a new phenotype'},
      {id: 'btnOpen', text: 'Open', iconClass:'fa fa-folder-open', event: $scope.load, disabled: false, tooltip: 'Open and edit one of your existing phenotypes'},
      {spacer: true},
      {id: 'btnSave', text: 'Save', iconClass:'fa fa-save', event: $scope.save, disabled: false, tooltip: 'Save changes to your phenotype'},
      {id: 'btnExport', text: 'Export', iconClass:'fa fa-arrow-circle-down', event: null, disabled: false, tooltip: 'Export the phenotype for use in an external application', dropdown: true, children: [{name: '(No exporters are available)'}]},
      {spacer: true},
      {id: 'btnCopy', text: 'Copy', iconClass:'fa fa-copy', event: $scope.copy, disabled: true},
      {id: 'btnPaste', text: 'Paste', iconClass:'fa fa-paste', event: $scope.paste, disabled: true},
      {id: 'btnUndo', text: 'Undo', iconClass:'fa fa-undo', disabled: true},
      {id: 'btnRedo', text: 'Redo', iconClass:'fa fa-repeat', disabled: true},
      {spacer: true},
      {id: 'btnDelete', text: 'Delete', iconClass:'fa fa-remove', event: $scope.delete, disabled: true, tooltip: 'Delete the highlighted element(s) in the canvas'},
      {spacer: true},
      {id: 'btnFeedback', text: 'Feedback', iconClass:'fa fa-comment', event: $scope.delete, disabled: true, tooltip: 'Suggestions or comments'},
    ];


    $scope.$on('sophe-search-valuesets', function(evt, dataElement) {
      var modalInstance = $modal.open({
        templateUrl: 'views/elements/valueSetsTermsDialog.html',
        controller: 'ValueSetsTermsDialogController',
        size: 'lg'
      });

      modalInstance.result.then(function (result) {
        if (result) {
          // If we just have a value set, we will create that and place it in the object
          var valueSet;
          var element = ValueSet.createElementFromData(result);
          valueSet = $scope.addWorkflowObject({x: 0, y: 0, element: element});
          dataElement.phemaObject().valueSet(valueSet);
          if (element.customList) {
            valueSet.phemaObject().customList(result);
            delete element.customList;
          }
          dataElement.getStage().draw();
        }
      });
    });

    // Special event handler such that whenever an element is selected, we are notified
    // and can enable/disable menu items for deleting, viewing properties, etc.
    $scope.$on('sophe-element-selected', function(evt, args) {
      $scope.$apply(function() {
        $scope.isPropertiesDisabled = !$scope.canShowProperties(args);
        _.findWhere($scope.buttons, {text: 'Delete'}).disabled = !$scope.canDelete();
      });
    });

    // Special event handler that's fired after a connection has been drawn between two
    // objects.  This brings up the property dialog for the temporal operator.
    $scope.$on('sophe-empty-temporal-operator-created', function() {
      $scope.$apply(function() {
        $scope.showProperties();
      });
    });

    // When the user tries to navigate away from the current page, check to see if there
    // are any unsaved changes.  This uses the checkForUnsavedChanges scope variable to
    // determine if a check should be made, or if it should be ignored (like when the
    // user confirms they don't want to save changes).
    $scope.$on('$locationChangeStart', function(event, next) {
      if ($scope.checkForUnsavedChanges && _hasPhenotypeChanged()) {
        event.preventDefault();
        _handleAskToSave(_forceNavigate, next.substr(next.indexOf('#') + 1));
      }
    });
  }]);
