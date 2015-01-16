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
        //'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":83,"y":42,"width":175,"height":54,"element":{"name":"Another Phenotype","type":"Phenotype"}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":7,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Another Phenotype","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"id":10,"className":"PhemaConnector"}]},{"attrs":{"x":258,"y":69,"points":[0,0,72,2,58.806374761579576,9.136403370614337,72,2,59.22288077018488,-5.857812939176436],"stroke":"black","originalStrokeWidth":2,"connectors":{"start":{"id":10},"end":{"id":14}},"label":{"id":17},"element":{"name":"","uri":"","type":"TemporalOperator"}},"id":16,"className":"PhemaConnection"},{"attrs":{"x":258,"y":74,"width":72,"fontFamily":"Calibri","fill":"black","align":"center","height":"auto","rotation":0.027770636593421036},"id":17,"className":"Text"},{"attrs":{"draggable":true,"x":330,"y":44,"width":175,"height":54,"element":{"name":"My Phenotype","type":"Phenotype"}},"id":11,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":12,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"My Phenotype","align":"center","padding":5,"height":"auto"},"id":13,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":16}]},"id":14,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":15,"className":"PhemaConnector"}]}]}'
        //'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":323,"y":54,"width":175,"height":194,"element":{"id":"EXP","name":"Care Experience","uri":"http://rdf.healthit.gov/qdm/element#EXP","type":"Category","children":[{"id":"PatientCareExperience","name":"Patient Care Experience","uri":"http://rdf.healthit.gov/qdm/element#PatientCareExperience","type":"DataElement"},{"id":"ProviderCareExperience","name":"Provider Care Experience","uri":"http://rdf.healthit.gov/qdm/element#ProviderCareExperience","type":"DataElement"}]}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":194,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":7,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Care Experience","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fill":"#EEEEEE","name":"termDrop","stroke":"#CCCCCC","strokeWidth":1},"id":9,"className":"Rect"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fontFamily":"Calibri","fontSize":14,"fill":"gray","text":"Drag and drop clinical terms or value sets here, or search for terms","align":"center","padding":5},"id":10,"className":"Text"},{"attrs":{"x":10,"y":109,"width":155,"height":75,"fill":"#EEEEEE","stroke":"#CCCCCC","strokeWidth":1},"id":11,"className":"Rect"},{"attrs":{"y":97,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":19}]},"id":12,"className":"PhemaConnector"},{"attrs":{"x":175,"y":97,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":13,"className":"PhemaConnector"}]},{"attrs":{"draggable":true,"x":85,"y":90,"width":175,"height":54,"element":{"name":"Another Phenotype","type":"Phenotype"}},"id":14,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":15,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Another Phenotype","align":"center","padding":5,"height":"auto"},"id":16,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":17,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":19}]},"id":18,"className":"PhemaConnector"}]},{"attrs":{"x":260,"y":117,"points":[0,0,61,36,46.00068500660591,35.85664823355338,61,36,53.6244887747231,22.938536293132596],"stroke":"black","originalStrokeWidth":2,"connectors":{"start":{"id":18},"end":{"id":12}},"label":{"id":20},"element":{"name":"","uri":"","type":"TemporalOperator"}},"id":19,"className":"PhemaConnection"},{"attrs":{"x":260,"y":117,"width":100,"fontFamily":"Calibri","fill":"black","align":"center","height":"auto"},"id":20,"className":"Text"}]}'
        //'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":31,"y":25,"width":215,"height":258,"element":{"id":"And","name":"And","uri":"http://rdf.healthit.gov/qdm/element#And","type":"LogicalOperator","children":[]}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":215,"height":258,"fill":"#eeeeee","name":"mainRect","stroke":"gray","strokeWidth":3,"dash":[10,5]},"id":7,"className":"Rect"},{"attrs":{"width":215,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"And","name":"header","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":129,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":215,"y":129,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":10,"className":"PhemaConnector"},{"attrs":{"draggable":true,"x":20,"y":44,"width":175,"height":194,"element":{"id":"PatientCareExperience","name":"Patient Care Experience","uri":"http://rdf.healthit.gov/qdm/element#PatientCareExperience","type":"DataElement"}},"id":16,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":194,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":17,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Patient Care Experience","align":"center","padding":5,"height":"auto"},"id":18,"className":"Text"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fill":"#EEEEEE","name":"termDrop","stroke":"#CCCCCC","strokeWidth":1},"id":19,"className":"Rect"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fontFamily":"Calibri","fontSize":14,"fill":"gray","text":"Drag and drop clinical terms or value sets here, or search for terms","align":"center","padding":5},"id":20,"className":"Text"},{"attrs":{"x":10,"y":109,"width":155,"height":75,"fill":"#EEEEEE","stroke":"#CCCCCC","strokeWidth":1},"id":21,"className":"Rect"},{"attrs":{"y":97,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":22,"className":"PhemaConnector"},{"attrs":{"x":175,"y":97,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":23,"className":"PhemaConnector"}]}]}]}'
        //'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":81,"y":29,"width":200,"height":200,"phemaObject":{"containedElements":[],"className":"LogicalOperator"},"element":{"id":"And","name":"And","uri":"http://rdf.healthit.gov/qdm/element#And","type":"LogicalOperator","children":[]}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":200,"height":200,"fill":"#eeeeee","name":"mainRect","stroke":"gray","strokeWidth":1,"dash":[10,5]},"id":7,"className":"Rect"},{"attrs":{"width":200,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"And","name":"header","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":100,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":200,"y":100,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":10,"className":"PhemaConnector"}]}]}'
        //'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"draggable":true,"x":23,"y":21,"width":215,"height":258,"phemaObject":{"containedElements":[{"id":11}],"className":"LogicalOperator"},"element":{"id":"And","name":"And","uri":"http://rdf.healthit.gov/qdm/element#And","type":"LogicalOperator","children":[]}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":215,"height":258,"fill":"#eeeeee","name":"mainRect","stroke":"gray","strokeWidth":3,"dash":[10,5]},"id":7,"className":"Rect"},{"attrs":{"width":215,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"And","name":"header","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":129,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":215,"y":129,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":10,"className":"PhemaConnector"},{"attrs":{"draggable":true,"x":20,"y":44,"phemaObject":{"className":"DataElement"},"width":175,"height":194,"element":{"id":"PatientCareExperience","name":"Patient Care Experience","uri":"http://rdf.healthit.gov/qdm/element#PatientCareExperience","type":"DataElement"}},"id":11,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":194,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":12,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Patient Care Experience","align":"center","padding":5,"height":"auto"},"id":13,"className":"Text"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fill":"#EEEEEE","name":"termDrop","stroke":"#CCCCCC","strokeWidth":1},"id":14,"className":"Rect"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fontFamily":"Calibri","fontSize":14,"fill":"gray","text":"Drag and drop clinical terms or value sets here, or search for terms","align":"center","padding":5},"id":15,"className":"Text"},{"attrs":{"x":10,"y":109,"width":155,"height":75,"fill":"#EEEEEE","stroke":"#CCCCCC","strokeWidth":1},"id":16,"className":"Rect"},{"attrs":{"y":97,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":17,"className":"PhemaConnector"},{"attrs":{"x":175,"y":97,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":18,"className":"PhemaConnector"}]}]}]}'
        //'{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"x":280,"y":313,"points":[0,0,193,-26,181.12723155022292,-16.832810172251364,193,-26,179.12459650296685,-31.698524176883012],"stroke":"black","originalStrokeWidth":2,"connectors":{"start":{"id":15},"end":{"id":9}},"label":{"id":28},"element":{"id":"During","uri":"http://rdf.healthit.gov/qdm/element#During","name":"During","type":"TemporalOperator","children":[],"timeRange":{"comparison":"","start":{"value":"","units":""},"end":{"value":"","units":""}}}},"id":27,"className":"PhemaConnection"},{"attrs":{"x":295,"y":347,"width":193,"fontFamily":"Calibri","fill":"black","text":"During","align":"center","height":"auto","rotation":-0.13390884398435857},"id":28,"className":"Text"},{"attrs":{"draggable":true,"x":181,"y":199,"phemaObject":{"className":"TemporalOperator"},"width":425,"height":175,"element":{"id":"During","uri":"http://rdf.healthit.gov/qdm/element#During","name":"During","type":"TemporalOperator","children":[],"timeRange":{"comparison":"","start":{"value":"","units":""},"end":{"value":"","units":""}}}},"id":16,"className":"PhemaGroup","children":[]},{"attrs":{"draggable":true,"x":80,"y":213,"width":215,"height":258,"phemaObject":{"containedElements":[{"id":29}],"className":"LogicalOperator"},"element":{"id":"And","name":"And","uri":"http://rdf.healthit.gov/qdm/element#And","type":"LogicalOperator","children":[]}},"id":11,"className":"PhemaGroup","children":[{"attrs":{"width":215,"height":258,"fill":"#eeeeee","name":"mainRect","stroke":"gray","strokeWidth":1,"dash":[10,5]},"id":12,"className":"Rect"},{"attrs":{"width":215,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"And","name":"header","align":"center","padding":5,"height":"auto"},"id":13,"className":"Text"},{"attrs":{"y":129,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":14,"className":"PhemaConnector"},{"attrs":{"x":215,"y":129,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":27}]},"id":15,"className":"PhemaConnector"},{"attrs":{"draggable":true,"x":20,"y":44,"phemaObject":{"className":"DataElement"},"width":175,"height":194,"element":{"id":"PatientCareExperience","name":"Patient Care Experience","uri":"http://rdf.healthit.gov/qdm/element#PatientCareExperience","type":"DataElement"}},"id":29,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":194,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":3},"id":30,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Patient Care Experience","align":"center","padding":5,"height":"auto"},"id":31,"className":"Text"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fill":"#EEEEEE","name":"termDrop","stroke":"#CCCCCC","strokeWidth":1},"id":32,"className":"Rect"},{"attrs":{"x":10,"y":29,"width":155,"height":75,"fontFamily":"Calibri","fontSize":14,"fill":"gray","text":"Drag and drop clinical terms or value sets here, or search for terms","align":"center","padding":5},"id":33,"className":"Text"},{"attrs":{"x":10,"y":109,"width":155,"height":75,"fill":"#EEEEEE","stroke":"#CCCCCC","strokeWidth":1},"id":34,"className":"Rect"},{"attrs":{"y":97,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":35,"className":"PhemaConnector"},{"attrs":{"x":175,"y":97,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":36,"className":"PhemaConnector"}]}]},{"attrs":{"draggable":true,"x":488,"y":289,"phemaObject":{"className":"GenericElement"},"width":175,"height":54,"element":{"name":"Another Phenotype","type":"Phenotype"}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":54,"fill":"#dbeef4","name":"mainRect","stroke":"black","strokeWidth":1},"id":7,"className":"Rect"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","text":"Another Phenotype","align":"center","padding":5,"height":"auto"},"id":8,"className":"Text"},{"attrs":{"y":27,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":27}]},"id":9,"className":"PhemaConnector"},{"attrs":{"x":175,"y":27,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":10,"className":"PhemaConnector"}]}]}'
        '{"attrs":{"id":"mainLayer"},"id":3,"className":"Layer","children":[{"attrs":{"x":298,"y":205.5,"points":[0,0,75,0,62.00961894323342,7.499999999999999,75,0,62.00961894323342,-7.499999999999999],"stroke":"black","originalStrokeWidth":2,"connectors":{"start":{"id":9},"end":{"id":13}},"label":{"id":18},"element":{"id":"During","uri":"http://rdf.healthit.gov/qdm/element#During","name":"During","type":"TemporalOperator","children":[]}},"id":17,"className":"PhemaConnection"},{"attrs":{"x":298,"y":210.5,"width":75,"fontFamily":"Calibri","fill":"black","text":"During","align":"center","height":"auto"},"id":18,"className":"Text"},{"attrs":{"draggable":true,"x":123,"y":118,"phemaObject":{"className":"TemporalOperator"},"width":425,"height":175,"element":{"id":"During","uri":"http://rdf.healthit.gov/qdm/element#During","name":"During","type":"TemporalOperator","children":[]}},"id":6,"className":"PhemaGroup","children":[{"attrs":{"width":175,"height":175,"fill":"white","name":"eventA","stroke":"gray","strokeWidth":1,"dash":[10,5]},"id":7,"className":"Rect"},{"attrs":{"y":87.5,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":8,"className":"PhemaConnector"},{"attrs":{"x":175,"y":87.5,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[{"id":17}]},"id":9,"className":"PhemaConnector"},{"attrs":{"width":175,"fontFamily":"Calibri","fontSize":18,"fill":"black","text":"Event A","name":"eventALabel","align":"center","padding":5,"height":"auto"},"id":10,"className":"Text"},{"attrs":{"y":53,"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","name":"eventAText","text":"(Drag and drop a data element here to define the event)","align":"center","padding":5,"height":"auto"},"id":11,"className":"Text"},{"attrs":{"x":250,"width":175,"height":175,"fill":"white","name":"eventB","stroke":"gray","strokeWidth":1,"dash":[10,5]},"id":12,"className":"Rect"},{"attrs":{"x":250,"y":87.5,"radius":7.5,"fill":"white","name":"leftConnector","stroke":"black","strokeWidth":1,"connections":[{"id":17}]},"id":13,"className":"PhemaConnector"},{"attrs":{"x":425,"y":87.5,"radius":7.5,"fill":"white","name":"rightConnector","stroke":"black","strokeWidth":1,"connections":[]},"id":14,"className":"PhemaConnector"},{"attrs":{"x":250,"width":175,"fontFamily":"Calibri","fontSize":18,"fill":"black","text":"Event B","name":"eventBLabel","align":"center","padding":5,"height":"auto"},"id":15,"className":"Text"},{"attrs":{"x":250,"y":53,"width":175,"fontFamily":"Calibri","fontSize":14,"fill":"black","name":"eventBText","text":"(Drag and drop a data element here to define the event)","align":"center","padding":5,"height":"auto"},"id":16,"className":"Text"}]}]}'
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
              return selectedElement.phemaObject().containedElements();
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
