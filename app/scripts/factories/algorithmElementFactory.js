'use strict';
/* globals Kinetic, DataElement, GenericElement, LogicalOperator, TemporalOperator */

angular.module('sophe.factories.algorithmElement', [])
  .factory('algorithmElementFactory', function() {
     function createQDMDataElement(config, scope) {
      var element = new DataElement();
      element.create(config, scope);
      return element.container();
    }

    function createQDMTemporalOperator(config, scope) {
      var element = new TemporalOperator();
      element.create(config, scope);
      return element.container();
    }

    function createQDMLogicalOperator(config, scope) {
      var element = new LogicalOperator();
      element.create(config, scope);
      return element.container();
    }

    function createGenericElement(config, scope) {
      var element = new GenericElement();
      element.create(config, scope);
      return element.container();
    }

    // Manages cleaning up all editor elements that may be associated with a group, such
    // as connector lines, references to connector lines, connector labels, etc.
    function _destroyGroup(group) {
      // In the group, find all connectors
      var connectors = group.find('.leftConnector, .rightConnector');
      connectors.each(function(connector) {
        var connections = connector.connections();
        var length = connections.length;
        for (var index = length-1; index >=0 ; index--) {
          connections[index].label.destroy();
          connections[index].destroy();
          delete connections[index];
        }
        connector.connections([]);
      });
      group.destroy();
    }

    var factory = {};
    factory.addWorkflowObject = function (config, scope) {
      // If there is no canvas to add to, we are done here
      if('undefined' === typeof scope.canvasDetails) {
        console.error('No canvas is defined');
        return null;
      }

      if ('undefined' === typeof(config) || null === config || !config.element) {
        console.error('No element definition was provided');
        return null;
      }

      var workflowObject = null;
      if (config.element.type === 'TemporalOperator') {
        workflowObject = createQDMTemporalOperator(config, scope);
      }
      else if (config.element.type === 'DataElement' || config.element.type === 'Category') {
        workflowObject = createQDMDataElement(config, scope);
      }
      else if (config.element.type === 'LogicalOperator') {
        workflowObject = createQDMLogicalOperator(config, scope);
      }
      else if (config.element.type === 'Phenotype') {
        workflowObject = createGenericElement(config, scope);
      }
      else {
        workflowObject = createGenericElement(config, scope);
      }

      if (workflowObject) {
        workflowObject.element(config.element);
      }

      return workflowObject;
    };

    factory.loadFromDefinition = function(scope, definition) {
      // If there is no canvas to remove from, we are done here
      if('undefined' === typeof scope.canvasDetails) {
          return null;
      }

      var stage = scope.canvasDetails.kineticStageObj;
      var layer = stage.find('#mainLayer')[0];
      layer = Kinetic.Node.create(definition);
      stage.add(layer);
      stage.mainLayer = layer;

      stage.mainLayer.get('Group').each(function(group) {
        var element = group.element();
        if (element.type === 'TemporalOperator') {
          var temporalOperator = new TemporalOperator();
          temporalOperator.load(group, scope);
        }
        else if (element.type === 'DataElement' || element.type === 'Category') {
          var dataElement = new DataElement();
          dataElement.load(group, scope);
        }
        else if (element.type === 'LogicalOperator') {
          var logicalOperator = new LogicalOperator();
          logicalOperator.load(group, scope);
        }
        else if (element.type === 'Phenotype') {
          var phenotype = new GenericElement();
          phenotype.load(group, scope);
        }
        else {
          var genericElement = new GenericElement();
          genericElement.load(group, scope);
        }
      });
    };

    factory.deleteSelectedObjects = function(scope) {
      // If there is no canvas to remove from, we are done here
      if('undefined' === typeof scope.canvasDetails) {
          return null;
      }

      var stage = scope.canvasDetails.kineticStageObj;
      stage.mainLayer.get('Group').each(function(group) {
        if (group.selected === true) {
          _destroyGroup(group);
        }
      });
      stage.draw();
    };

    factory.getFirstSelectedItem = function(scope) {
      if (!scope.canvasDetails || !scope.canvasDetails.kineticStageObj) {
        return null;
      }

      var stage = scope.canvasDetails.kineticStageObj;
      var layer = stage.find('#mainLayer')[0];
      var children = layer.getChildren();
      for (var counter = 0; counter < children.length; counter++) {
        if (children[counter].selected) {
          return children[counter];
        }
      }

      return null;
    };

    return factory;
});