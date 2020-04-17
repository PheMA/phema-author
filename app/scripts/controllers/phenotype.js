'use strict';
/* globals ArrayUtil, findParentElementByName, ValueSet, Constants, _ */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypeController
 * @description
 * # PhenotypeController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeController', ['$scope', '$q', '$routeParams', '$uibModal', '$location', '$window', '$timeout', 'algorithmElementFactory', 'FHIRElementService', 'CQLElementService', 'LibraryService', 'ConfigurationService', function ($scope, $q, $routeParams, $uibModal, $location, $window, $timeout, algorithmElementFactory, FHIRElementService, CQLElementService, LibraryService, ConfigurationService) {
    $scope.phenotype = ($routeParams.id ? {id: $routeParams.id } : null );
    $scope.status = { open: []};
    $scope.isPropertiesDisabled = true;
    $scope.successMessage = null;
    $scope.errorMessage = null;
    $scope.checkForUnsavedChanges = true;
    $scope.treeOptions = {
      dirSelectable: false
    };
    $scope.cqlTypes = [];

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

    $scope.$on('onBeforeUnload', function (e, confirmation) {
        if (_hasPhenotypeChanged()) {
         confirmation.message = 'You have some unsaved changes that may be lost.';
          e.preventDefault();
        }
    });

    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) { $scope.phenotypes = elements; });

    FHIRElementService.load()
      .then(FHIRElementService.processValues)
      .then(function(elements) { $scope.fhirElements = elements; });

    CQLElementService.load()
      .then(CQLElementService.processValues)
      .then(function(elements) {
        $scope.cqlTypes = elements;
        // Now that we know how many CQL categories, we can establish our
        // internal tracking array for what's being displayed.  There are 3
        // pre-defined sidebar panels that appear ahead of ours.
        $scope.status.open = Array(3 + elements.length).fill(false);

        var promises = CQLElementService.expandTypes(elements);
        $q.all(promises).then(function(expanded) {
          for (let index in expanded) {
            const type = expanded[index];
            const found = $scope.cqlTypes.find(element => element.id === type.typeId);
            if (found) {
              found.children = type.data;
            }
          }
        });
      });

    // The list of classification elements is pretty small and manageable, and doesn't need to be tightly controlled.  We will
    // just put the list in here instead of setting up a service.
    $scope.classifications = [
      { 'name': 'Case', 'description' : 'Affected individuals as part of a case/control algorithm', 'type' : Constants.ElementTypes.CLASSIFICATION },
      { 'name': 'Control', 'description' : 'Unaffected individuals as part of a case/control algorithm', 'type' : Constants.ElementTypes.CLASSIFICATION },
      { 'name': 'My Label', 'description' : 'Define a custom label for your phenotype algorithm result', 'type' : Constants.ElementTypes.CLASSIFICATION }
    ];

    // Update the phenotype metadata so that it is available within the phenotype definition
    // for export.  This needs to be synced each time we update/save.
    function _setPhenotypeData(id, name, description) {
      $scope.canvasDetails.kineticStageObj.mainLayer.setAttr('phenotypeData', {'id':id, 'name':name, 'description':description});
    }

    $scope.export = function() {
      var exporter = this;
      $uibModal.open({
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
    };

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
          $scope.checkForUnsavedChanges = false;
          $location.path('/phenotype/' + data.id);
          $timeout(_resetMessages, 5000); // Only timeout success
        }, function() {
          _setPhenotypeData('', result.name, result.description);
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
      var modalInstance = $uibModal.open({
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
      var modalInstance = $uibModal.open({
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

    $scope.feedback = function() {
      $window.open('https://github.com/phema/phema-author/issues', '_blank');
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
        // Make imgage of phenotype and save
        $scope.canvasDetails.kineticStageObj.toImage({callback: function(image){
          console.log(image.src);
           $scope.phenotype.image = image.src;
          _handlePhenotypeSave($scope.phenotype);
        }});
        //_handlePhenotypeSave($scope.phenotype);
      }
      else {
        var modalInstance = $uibModal.open({
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
      return (element.type === Constants.ElementTypes.TEMPORAL_OPERATOR ||
        element.type === Constants.ElementTypes.LOGICAL_OPERATOR ||
        element.type === Constants.ElementTypes.CATEGORY ||
        element.type === Constants.ElementTypes.PHENOTYPE ||
        element.type === Constants.ElementTypes.DATA_ELEMENT ||
        element.type === Constants.ElementTypes.VALUE_SET ||
        element.type === Constants.ElementTypes.SUBSET_OPERATOR ||
        element.type === Constants.ElementTypes.FUNCTION_OPERATOR ||
        element.type === Constants.ElementTypes.CLASSIFICATION);
    };

    function _getConnectorElementType(selectedConnection, start) {
      if (selectedConnection === null || selectedConnection.attrs === null || selectedConnection.attrs.connectors === null) {
        return null;
      }

      var contextItem = start ? selectedConnection.attrs.connectors.start : selectedConnection.attrs.connectors.end;
      if (contextItem === null || contextItem.parent === null || contextItem.parent.attrs === null || contextItem.parent.attrs.element === null) {
        return null;
      }

      return contextItem.parent.attrs.element.type;
    }

    // Update an element with a new set of value set data.
    //   selectedElement - the element in the canvas that has been selected and should be updated.
    //   valueSetData - the configuration data (typically generated from a call to ValueSet.createElementFromData) to use for the value set.
    //   customListData - the custom list information for the value set (if applicable).  This may be empty if an existing value set was used.
    function _updateCustomValueSetData(selectedElement, valueSetData, customListData) {
      var valueSetObject = $scope.addWorkflowObject({x: 0, y: 0, element: valueSetData});
      selectedElement.phemaObject().valueSet(valueSetObject);
      if (valueSetData.customList) {
        valueSetObject.phemaObject().customList(customListData);
      }
      selectedElement.getStage().draw();
    }

    $scope.showProperties = function() {
      var selectedElement = algorithmElementFactory.getFirstSelectedItem($scope);
      if (!$scope.canShowProperties(selectedElement)) {
        return;
      }

      var modalInstance = null;
      var element = selectedElement.element();
      if (element.type === Constants.ElementTypes.TEMPORAL_OPERATOR) {
        modalInstance = $uibModal.open({
          templateUrl: 'views/properties/relationship.html',
          controller: 'RelationshipPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            temporalOperators: function() {
              return $scope.temporalOperators;
            },
            startLabel: function() {
              var startType = _getConnectorElementType(selectedElement, true);
              return (startType === null || startType === Constants.ElementTypes.TEMPORAL_OPERATOR) ? 'Event A' : selectedElement.attrs.connectors.start.parent.attrs.element.name;
            },
            endLabel: function() {
              var endType = _getConnectorElementType(selectedElement, false);
              return (endType === null || endType === Constants.ElementTypes.TEMPORAL_OPERATOR) ? 'Event B' : selectedElement.attrs.connectors.end.parent.attrs.element.name;
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
      else if (element.type === Constants.ElementTypes.LOGICAL_OPERATOR) {
        modalInstance = $uibModal.open({
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
      else if (element.type === Constants.ElementTypes.CATEGORY || element.type === Constants.ElementTypes.DATA_ELEMENT) {
        // We define the element properties based on the URI (if it's QDM or FHIR)
        var isFHIR = (element.uri.indexOf('fhir') >= 0);
        modalInstance = $uibModal.open({
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
            // If the value set has a different ID (meaning it's changed), or if there is no ID for the
            // new value set (meaning it's a custom value set) we're going to do an update.
            if (existingValueSet.element().id !== result.valueSet.id ||
              result.valueSet.id === '' && result.valueSet.customList) {
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
            _updateCustomValueSetData(selectedElement, result.valueSet, result.valueSet.customList);
          }
        });
      }
      else if (element.type === Constants.ElementTypes.PHENOTYPE) {
        modalInstance = $uibModal.open({
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
      else if (element.type === Constants.ElementTypes.VALUE_SET) {
        modalInstance = $uibModal.open({
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
      else if (element.type === Constants.ElementTypes.SUBSET_OPERATOR) {
        modalInstance = $uibModal.open({
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
      else if (element.type === Constants.ElementTypes.FUNCTION_OPERATOR) {
        modalInstance = $uibModal.open({
          templateUrl: 'views/properties/functionOperator.html',
          controller: 'FunctionOperatorPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            attributes: function () {
              return angular.copy(selectedElement.phemaObject().attributes());
            },
            containedElements: function () {
              return selectedElement.phemaObject().containedElements();
            }
          }
        });

        modalInstance.result.then(function (result) {
          selectedElement.update(result);
        });
      }
      else if (element.type === Constants.ElementTypes.CLASSIFICATION) {
        modalInstance = $uibModal.open({
          templateUrl: 'views/properties/classification.html',
          controller: 'ClassificationPropertiesController',
          size: 'md',
          resolve: {
            element: function () {
              return angular.copy(element);
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
      {id: 'btnFeedback', text: 'Feedback', iconClass:'fa fa-comment', event: $scope.feedback, disabled: false, tooltip: 'Suggestions or comments'},
    ];

    // Exporters that we create will be reformatted similar to menu items.
    ConfigurationService.load()
       .then(function(exporters) { return ConfigurationService.processExportersForMenu(exporters, $scope.export); })
       .then(function(exporters) { _.findWhere($scope.buttons, {text: 'Export'}).children = exporters; });

    $scope.$on(Constants.Events.SEARCH_VALUESETS, function(evt, dataElement) {
      var modalInstance = $uibModal.open({
        templateUrl: 'views/elements/valueSetsTermsDialog.html',
        controller: 'ValueSetsTermsDialogController',
        size: 'lg'
      });

      modalInstance.result.then(function (result) {
        if (result) {
          // If we just have a value set, we will create that and place it in the object
          var element = ValueSet.createElementFromData(result);
          _updateCustomValueSetData(dataElement, element, result);
        }
      });
    });

    // Special event handler such that whenever an element is selected, we are notified
    // and can enable/disable menu items for deleting, viewing properties, etc.
    $scope.$on(Constants.Events.ELEMENT_SELECTED, function(evt, args) {
      $scope.$apply(function() {
        $scope.isPropertiesDisabled = !$scope.canShowProperties(args);
        _.findWhere($scope.buttons, {text: 'Delete'}).disabled = !$scope.canDelete();
      });
    });

    // Special event handler that's fired after a connection has been drawn between two
    // objects.  This brings up the property dialog for the temporal operator.
    $scope.$on(Constants.Events.CREATE_TEMPORAL_OPERATOR, function() {
      $scope.$apply(function() {
        $scope.showProperties();
      });
    });

    $scope.$on(Constants.Events.CREATE_CLASSIFICATION, function() {
      $scope.showProperties();
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
