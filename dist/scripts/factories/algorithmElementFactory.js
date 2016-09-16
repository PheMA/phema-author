'use strict';
/* globals Kinetic, DataElement, GenericElement, LogicalOperator, TemporalOperator, ValueSet, Term, SubsetOperator, FunctionOperator, PhenotypeElement, 
 getIntersectingShape, allowsDrop, addElementToContainer, removeElementFromContainer, resizeStageForEvent */

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

    function createQDMSubsetOperator(config, scope) {
      var element = new SubsetOperator();
      element.create(config, scope);
      return element.container();
    }

    function createQDMFunctionOperator(config, scope) {
      var element = new FunctionOperator();
      element.create(config, scope);
      return element.container();
    }

    function createValueSet(config, scope) {
      var element = new ValueSet();
      element.create(config, scope);
      return element.container();
    }

    function createTerm(config, scope) {
      var element = new Term();
      element.create(config, scope);
      return element.container();
    }

    function createPhenotypeElement(config, scope) {
      var element = new PhenotypeElement();
      element.create(config, scope);
      return element.container();
    }

    function createGenericElement(config, scope) {
      var element = new GenericElement();
      element.create(config, scope);
      return element.container();
    }

    function _destroyConnection(connection) {
      var connectors = connection.connectors();

      // Remove references to the connectors this line is connected with
      var connectionsReference = connectors.start.connections();
      var updatedConnections = connectionsReference.filter(function(obj) { return connection._id !== obj._id; });
      connectors.start.connections(updatedConnections);
      connectionsReference = connectors.end.connections();
      updatedConnections = connectionsReference.filter(function(obj) { return connection._id !== obj._id; });
      connectors.end.connections(updatedConnections);

      // Next, remove our references to the connectors
      connection.connectors({start: null, end: null});

      // Remove the label associated with this connection
      connection.label().destroy();
      connection.label(null);

      // Finally, destroy this connection
      connection.destroy();
    }

    function _destroyGroup(group) {
      // Ensure we have cleaned ourselves up from any containers we were in
      removeElementFromContainer(null, group);

      // In the group, find all connectors
      var connectors = group.find('.leftConnector, .rightConnector');
      connectors.each(function(connector) {
        var connections = connector.connections();
        var length = connections.length;
        for (var index = length-1; index >=0 ; index--) {
          var label = connections[index].label();
          if (label) {
            connections[index].label().destroy();
            connections[index].label(null);
          }
          connections[index].destroy();
          delete connections[index];
        }
        connector.connections([]);
      });

      if (group.deleteReferences) {
        group.deleteReferences();
      }
      group.destroy();
    }

    // Recursive version of getSelectedItem that will look for the first selected item
    // or descendant, starting with 'item'
    function _getSelectedItemOrDescendant(item) {
      if (item.selected) {
        return item;
      }
      else if (item.nodeType === 'Group' || item.nodeType === 'Layer') {
        var children = item.getChildren();
        var selectedItem = null;
        for (var counter = 0; counter < children.length; counter++) {
          selectedItem = _getSelectedItemOrDescendant(children[counter]);
          if (selectedItem) {
            return selectedItem;
          }
        }
      }

      return null;
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
      else if (config.element.type === 'SubsetOperator') {
        workflowObject = createQDMSubsetOperator(config, scope);
      }
      else if (config.element.type === 'FunctionOperator') {
        workflowObject = createQDMFunctionOperator(config, scope);
      }
      else if (config.element.type === 'Phenotype') {
        workflowObject = createPhenotypeElement(config, scope);
      }
      else if (config.element.type === 'ValueSet') {
        workflowObject = createValueSet(config, scope);
      }
      else if (config.element.type === 'Term') {
        workflowObject = createTerm(config, scope);
      }
      else {
        workflowObject = createGenericElement(config, scope);
      }

      if (workflowObject) {
        workflowObject.element(config.element);
      }

      // If we dropped on top of a valid drop target, we are going to process the
      // drop event.
      var stage = scope.canvasDetails.kineticStageObj;
      var dropShape = getIntersectingShape(stage.mainLayer, {x: config.x, y: config.y}, true, workflowObject);
      if (dropShape && allowsDrop(workflowObject, dropShape)) {
        addElementToContainer(stage, dropShape, workflowObject);
      }

      return workflowObject;
    };

    // Manages cleaning up all editor elements that may be associated with a group, such
    // as connector lines, references to connector lines, connector labels, etc.
    factory.destroyGroup = function(group) {
      _destroyGroup(group);
    };

    factory.destroyConnection = function(connection) {
      _destroyConnection(connection);
    };

    factory.loadFromDefinition = function(scope, definition) {
      // If there is no canvas to remove from, we are done here.
      // Likewise, if the definition isn't defined, don't continue.
      if('undefined' === typeof scope.canvasDetails ||
        'undefined' === typeof definition) {
          return null;
      }

      // Kinetic expects a string.  If we passed in a JSON object, we need to first convert it
      // to a string before it can be used
      if ('object' === typeof definition) {
        definition = JSON.stringify(definition);
      }

      var stage = scope.canvasDetails.kineticStageObj;
      var layer = stage.mainLayer;
      layer.get('Group').each(function(group) {
        _destroyGroup(group);
      });
      layer.destroy();
      layer = Kinetic.Node.create(definition);
      stage.add(layer);
      stage.mainLayer = layer;

      // Reorder the layers
      stage.backgroundLayer.setZIndex(1);
      stage.mainLayer.setZIndex(2);
      stage.tempLayer.setZIndex(3);

      var groups = stage.mainLayer.get('Group');
      groups.each(function(group) {
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
        else if (element.type === 'SubsetOperator') {
          var subsetOperator = new SubsetOperator();
          subsetOperator.load(group, scope);
        }
        else if (element.type === 'FunctionOperator') {
          var functionOperator = new FunctionOperator();
          functionOperator.load(group, scope);
        }
        else if (element.type === 'ValueSet') {
          var valueSet = new ValueSet();
          valueSet.load(group, scope);
        }
        else if (element.type === 'Phenotype') {
          var phenotype = new PhenotypeElement();
          phenotype.load(group, scope);
        }
        else {
          var genericElement = new GenericElement();
          genericElement.load(group, scope);
        }
      });

      // If there are any items in the canvas, make the stage resize to accommodate
      // them.
      if (groups.length > 0) {
        resizeStageForEvent(stage, null, groups[0]);
      }
    };

    factory.deleteSelectedObjects = function(scope) {
      // If there is no canvas to remove from, we are done here
      if('undefined' === typeof scope.canvasDetails) {
        console.error('No canvas is defined');
        return;
      }

      var stage = scope.canvasDetails.kineticStageObj;
      stage.mainLayer.get('Group').each(function(group) {
        if (group.selected === true) {
          _destroyGroup(group);
        }
      });
      stage.mainLayer.find('PhemaConnection').each(function(connection) {
        if (connection.selected === true) {
          _destroyConnection(connection);
        }
      });
      stage.draw();
    };

    factory.getFirstSelectedItem = function(scope) {
      if (!scope.canvasDetails || !scope.canvasDetails.kineticStageObj) {
        return null;
      }

      var layer = scope.canvasDetails.kineticStageObj.mainLayer;
      return _getSelectedItemOrDescendant(layer);
    };

    return factory;
});