'use strict';
/* globals ArrayUtil, findParentElementByName */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypeController
 * @description
 * # PhenotypeController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  // .filter('temporalFilter', function() {
  //   return function(items) {
  //     if (items) {
  //       var advancedRegEx = new RegExp('^[a-z]+\\sConcurrent With', 'i');
  //       var list = items.filter(function(element) {
  //         return (element.label.search(advancedRegEx) === -1);
  //       });
  //       return list;
  //     }
  //   };
  // })
  .controller('PhenotypeController', ['$scope', '$http', '$routeParams', '$modal', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', 'QDMElementService', 'LibraryService', function ($scope, $http, $routeParams, $modal, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService, QDMElementService, LibraryService) {
    $scope.phenotype = $routeParams.id;
    $scope.status = { open: [true, false, false, false]};
    $scope.isDeleteDisabled = true;
    $scope.isPropertiesDisabled = true;
    var advancedRegEx = new RegExp('[a-z]+\\sConcurrent With', 'i');
    $scope.temporalFilter = function(item) {
      if (item) {
        return (item.name.search(advancedRegEx) === -1);
      }
    };

    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) { $scope.phenotypes = elements; });

    QDMElementService.load()
      .then(QDMElementService.processValues)
      .then(function(elements) { $scope.dataElements = elements; });

    LogicalOperatorService.load()
      .then(LogicalOperatorService.processValues)
      .then(function(operators) { $scope.logicalOperators = operators; });

    TemporalOperatorService.load()
      .then(TemporalOperatorService.processValues)
      .then(function(operators) { $scope.temporalOperators = operators; });

    $scope.treeOptions = {
      dirSelectable: false
    };

    $scope.$on('sophe-element-selected', function(evt, args) {
      $scope.$apply(function() {
        $scope.isPropertiesDisabled = !$scope.canShowProperties(args);
        $scope.isDeleteDisabled = !$scope.canDelete();
      });
    });

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

    $scope.save = function() {
      console.log($scope.canvasDetails.kineticStageObj.find('#mainLayer')[0].toJSON());
    };

    $scope.load = function() {
      algorithmElementFactory.loadFromDefinition($scope,
//        '{"attrs":{"id":"mainLayer"},"className":"Layer","children":[{"attrs":{"draggable":true,"x":75,"y":52,"width":175,"height":194,"element":{"id":"PatientCareExperience","name":"Patient Care Experience","uri":"http://rdf.healthit.gov/qdm/element#PatientCareExperience","type":"DataElement"}},"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":194,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Patient Care Experience","align":"center","padding":5,"height":"auto"},"className":"Text"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fill":"#EEEEEE","name":"termDrop","stroke":"#CCCCCC","strokeWidth":1},"className":"Rect"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fontFamily":"Calibri","fontSize":14,"fill":"gray","text":"Drag and drop clinical terms or value sets here, or search for terms","align":"center","padding":5},"className":"Text"},{"attrs":{"x":10,"y":109,"width":155,"height":75,"fill":"#EEEEEE","stroke":"#CCCCCC","strokeWidth":1},"className":"Rect"},{"attrs":{"y":97,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"className":"Circle"},{"attrs":{"x":175,"y":97,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"className":"Circle"}]}]}'
//'{"attrs":{"id":"mainLayer"},"className":"Layer","children":[{"attrs":{"draggable":true,"x":92,"y":55,"width":175,"height":194,"element":{"id":"PatientCareExperience","name":"Patient Care Experience","uri":"http://rdf.healthit.gov/qdm/element#PatientCareExperience","type":"DataElement"}},"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":194,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Patient Care Experience","align":"center","padding":5,"height":"auto"},"className":"Text"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fill":"#EEEEEE","name":"termDrop","stroke":"#CCCCCC","strokeWidth":1},"className":"Rect"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fontFamily":"Calibri","fontSize":14,"fill":"gray","text":"Drag and drop clinical terms or value sets here, or search for terms","align":"center","padding":5},"className":"Text"},{"attrs":{"x":10,"y":109,"width":155,"height":75,"fill":"#EEEEEE","stroke":"#CCCCCC","strokeWidth":1},"className":"Rect"},{"attrs":{"y":97,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"className":"PhemaConnector"},{"attrs":{"x":175,"y":97,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"className":"PhemaConnector"}]}]}'
//'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":121,"y":53,"width":175,"height":54,"element":{"name":"Another Phenotype","type":"Phenotype"}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":7,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Another Phenotype","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"className":"PhemaConnector"}]},{"attrs":{"draggable":true,"x":368,"y":49,"width":175,"height":54,"element":{"name":"My Phenotype","type":"Phenotype"}},"id":11,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":12,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"My Phenotype","align":"center","padding":5,"height":"auto"},"id":13,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"className":"PhemaConnector"}]},{"attrs":{"x":296,"y":80,"points":[0,0,72,-2,59.22288077018488,5.857812939176436,72,-2,58.806374761579576,-9.136403370614337],"stroke":"black","originalStrokeWidth":2,"connectors":[],"label":{"id":17},"element":{"name":"","uri":"","type":"TemporalOperator"}},"className":"PhemaConnection"},{"attrs":{"x":296,"y":80,"width":100,"fontFamily":"Calibri","fill":"black","align":"center","height":"auto"},"id":17,"className":"Text"}]}'
//'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":126,"y":55,"width":175,"height":54,"element":{"name":"Another Phenotype","type":"Phenotype"}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":7,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Another Phenotype","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"id":10,"className":"PhemaConnector"}]},{"attrs":{"draggable":true,"x":438,"y":69,"width":175,"height":54,"element":{"name":"My Phenotype","type":"Phenotype"}},"id":11,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":12,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"My Phenotype","align":"center","padding":5,"height":"auto"},"id":13,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"id":14,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":15,"className":"PhemaConnector"}]},{"attrs":{"x":301,"y":82,"points":[0,0,132,18,118.11538951906464,23.67605424504558,132,18,120.14208759006435,8.813601724381098],"stroke":"black","originalStrokeWidth":2,"connectors":[],"label":{"id":17},"element":{"name":"","uri":"","type":"TemporalOperator"}},"id":16,"className":"PhemaConnection"},{"attrs":{"x":301,"y":82,"width":100,"fontFamily":"Calibri","fill":"black","align":"center","height":"auto"},"id":17,"className":"Text"}]}'
'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":83,"y":42,"width":175,"height":54,"element":{"name":"Another Phenotype","type":"Phenotype"}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":7,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Another Phenotype","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"id":10,"className":"PhemaConnector"}]},{"attrs":{"x":258,"y":69,"points":[0,0,72,2,58.806374761579576,9.136403370614337,72,2,59.22288077018488,-5.857812939176436],"stroke":"black","originalStrokeWidth":2,"connectors":{"start":{"id":10},"end":{"id":14}},"label":{"id":17},"element":{"name":"","uri":"","type":"TemporalOperator"}},"id":16,"className":"PhemaConnection"},{"attrs":{"x":258,"y":74,"width":72,"fontFamily":"Calibri","fill":"black","align":"center","height":"auto","rotation":0.027770636593421036},"id":17,"className":"Text"},{"attrs":{"draggable":true,"x":330,"y":44,"width":175,"height":54,"element":{"name":"My Phenotype","type":"Phenotype"}},"id":11,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":12,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"My Phenotype","align":"center","padding":5,"height":"auto"},"id":13,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"id":14,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":15,"className":"PhemaConnector"}]}]}'
);
    };

    $scope.buttons = [
      {text: 'Save', iconClass:'fa fa-save', event: $scope.save},
      {text: 'Load', iconClass:'fa fa-folder-open', event: $scope.load},
      {text: 'Export', iconClass:'fa fa-arrow-circle-down'},
      {spacer: true},
      {text: 'Copy', iconClass:'fa fa-copy', event: $scope.copy},
      {text: 'Paste', iconClass:'fa fa-paste', event: $scope.paste},
      {text: 'Undo', iconClass:'fa fa-undo'},
      {text: 'Redo', iconClass:'fa fa-repeat'}
    ];

    $scope.canShowProperties = function(item) {
      var selectedElement = item || algorithmElementFactory.getFirstSelectedItem($scope);
      if (!selectedElement || !selectedElement.element) {
        return false;
      }

      var element = selectedElement.element();
      return (element.type === 'TemporalOperator' ||
        element.type === 'LogicalOperator' ||
        element.type === 'Category' ||
        element.type === 'DataElement');
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
              return selectedElement.containedElements;
            },
            logicalOperators: function() {
              return $scope.logicalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          element = result;
          findParentElementByName(selectedElement, 'header').setText(element.name);
          selectedElement.getStage().draw();
        });
      }
      else if (element.type === 'Category' || element.type === 'DataElement') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/qdmElement.html',
          controller: 'QDMElementPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            }
          }
        });

        modalInstance.result.then(function (result) {
          element.attributes = result;
        });
      }
    };
  }]);
