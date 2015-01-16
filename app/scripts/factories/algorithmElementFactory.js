'use strict';
/* globals Kinetic, DataElement, GenericElement, LogicalOperator, TemporalOperator */

angular.module('sophe.factories.algorithmElement', [])
  .factory('algorithmElementFactory', function() {
    // function addConnectionHandler(kineticObj, scope) {
    //   var stage = scope.canvasDetails.kineticStageObj;
    //   kineticObj.on('mouseup', function (e) {
    //     endConnector(stage, e.target, scope);
    //   });
    //   kineticObj.on('mousemove', function(evt) {
    //     updateActiveLineLocation(stage, evt);
    //   });
    //   kineticObj.on('mousedown', function (e) {
    //     endConnector(stage, undefined, scope);  // Make sure it's not carrying over from before
    //     startConnector(stage, e.target);
    //   });
    // }

    // function addStandardEventHandlers(kineticObj, scope) {
    //   var stage = scope.canvasDetails.kineticStageObj;
    //   kineticObj.on('mousemove', function(evt) {
    //     updateActiveLineLocation(stage, evt);
    //   });
    //   kineticObj.on('mouseup', function() {
    //     endConnector(stage, undefined, scope);
    //     clearSelections(stage);
    //     selectObject(stage, kineticObj, scope);
    //   });

    //   // When we are dragging, move the drag object to be the top element, clear all
    //   // other selections, and then visually select the dragging element.
    //   kineticObj.on('dragstart', function() {
    //     kineticObj.setZIndex(999);
    //     clearSelections(stage);
    //     selectObject(stage, kineticObj, scope);
    //     kineticObj.draw();
    //   });

    //   setDraggable(kineticObj, scope);
    // }

    // function addCursorEventHandlers(kineticObj, scope) {
    //   // add cursor styling
    //   kineticObj.on('mouseover', function () {
    //       document.body.style.cursor = 'pointer';
    //   });
    //   kineticObj.on('mouseout', function () {
    //       document.body.style.cursor = 'default';
    //       scope.$emit('CANVAS-MOUSEOUT');
    //   });
    // }

    // // Sets up a Kinetic shape to be a droppable target that accepts an array of types that
    // // can be dropped on it.
    // function setDroppable(kineticObj, allowedDropTypes) {
    //   kineticObj.droppable = true;
    //   kineticObj.droppableElementTypes = allowedDropTypes;
    // }

    // // Adds appropriate event handlers to a draggable object.
    // // Idea for temp layer so we can use getIntersection courtesy of: http://jsbin.com/pecor/3/edit?html,js,output
    // function setDraggable(kineticObj, scope) {
    //   var stage = scope.canvasDetails.kineticStageObj;
    //   var highlightedDrop = null;

    //   var dragItem = kineticObj;
    //   if ('Group' !== kineticObj.nodeType) {
    //     dragItem = kineticObj.getParent();
    //   }

    //   dragItem.on('dragstart',function(){
    //     dragItem.moveTo(stage.tempLayer);
    //     Kinetic.DD.isDragging = false;
    //     stage.mainLayer.draw();
    //     Kinetic.DD.isDragging = true;
    //     var dd = Kinetic.DD;
    //     dd.anim.stop();
    //     dd.anim.setLayers(stage.tempLayer);
    //     dd.anim.start();
    //   });

    //   dragItem.on('dragmove',function(e){
    //     var pos = stage.getPointerPosition();
    //     // We can't use the KineticJS getIntersection because when we are moving the mouse we
    //     // need to redraw the different layers to account for connector arrows moving.  Because
    //     // we do the redraw, it invalidates the underlying image that getIntersections relies on.
    //     var shape = getIntersectingShape(stage.mainLayer, pos);
    //     if (!shape) {
    //       // If we don't have a spot to drop, but we did before, clean up the old shape so it's not
    //       // still highlighted as an active drop target.
    //       if (highlightedDrop) {
    //         updateStrokeWidth(highlightedDrop, true);
    //         highlightedDrop.getParent().draw();
    //         highlightedDrop = null;
    //       }
    //       document.body.style.cursor = 'default';
    //       return;
    //     }

    //     if (shape.droppable && shape !== highlightedDrop) {
    //       if (!allowsDrop(e.target, shape)) {
    //         document.body.style.cursor = 'no-drop';
    //       }

    //       if (highlightedDrop) {
    //         updateStrokeWidth(highlightedDrop, true);
    //       }
    //       highlightedDrop = shape;
    //       updateStrokeWidth(shape, false);
    //       highlightedDrop.getParent().draw();
    //     }
    //   });

    //   dragItem.on('dragend',function(){
    //     dragItem.moveTo(stage.mainLayer); // Must do this before remove element
    //     removeElementFromContainer(stage, dragItem);  // Clear from a container, if it was in one before
    //     document.body.style.cursor = 'default';
    //     if (highlightedDrop) {
    //       if (allowsDrop(dragItem, highlightedDrop)) {
    //         addElementToContainer(stage, highlightedDrop, dragItem);
    //       }
    //       updateStrokeWidth(highlightedDrop, true);
    //       highlightedDrop = null;
    //       stage.mainLayer.draw();
    //     }
    //   });
    // }

    // function createText(options, group) {
    //   if ('undefined' === typeof options.text || '' === options.text) {
    //     options.text = 'New Item';
    //   }

    //   var kineticObj = new Kinetic.Text(options);
    //   group.add(kineticObj);
    //   return kineticObj;
    // }

    // function createRectangle(options, group) {
    //   var kineticObj = new Kinetic.Rect(options);
    //   group.add(kineticObj);
    //   kineticObj.originalStrokeWidth = options.strokeWidth;
    //   return kineticObj;
    // }

    // function createConnector(options, group) {
    //   var kineticObj = new Kinetic.PhemaConnector(options);
    //   group.add(kineticObj);
    //   kineticObj.originalStrokeWidth(options.strokeWidth);
    //   return kineticObj;
    // }

    // function connectConnectorEvents(group) {
    //   group.on('dragmove', function(e) {
    //     // e.target is assumed to be a Group
    //     if (e.target.nodeType !== 'Group') {
    //       console.error('Unsupported object' + e.target);
    //       return;
    //     }

    //     // For the element we are moving, redraw all connection lines
    //     var stage = group.getStage();
    //     updateConnectedLines(e.target.find('.rightConnector')[0], stage);
    //     updateConnectedLines(e.target.find('.leftConnector')[0], stage);
    //     stage.find('#mainLayer').draw();
    //   });
    // }

    // function addConnectors(scope, mainRect, group, trackDrag) {
    //   trackDrag = (typeof trackDrag !== 'undefined') ? trackDrag : true;

    //   var leftConnectOptions = {
    //     x: mainRect.getX(), y: (mainRect.getHeight() / 2),
    //     width: 15, height: 15,
    //     fill: 'white', name: 'leftConnector',
    //     stroke: 'black', strokeWidth: 1
    //   };
    //   var leftObj = createConnector(leftConnectOptions, group);
    //   addOutlineStyles(leftObj);
    //   leftObj.connections([]);

    //   var rightConnectOptions = {
    //     x: mainRect.getX() + mainRect.getWidth(), y: (mainRect.getHeight() / 2),
    //     width: 15, height: 15,
    //     fill: 'white', name: 'rightConnector',
    //     stroke: 'black', strokeWidth: 1
    //   };
    //   var rightObj = createConnector(rightConnectOptions, group);
    //   addOutlineStyles(rightObj);
    //   rightObj.connections([]);

    //   if (trackDrag) {
    //     connectConnectorEvents(group);
    //   }

    //   return [leftObj, rightObj];
    // }


    // // Connects the appropriate QDM data element shapes to event handlers.
    // // Used when constructing a new element, or when loading from a definition.
    // function connectQDMDataElementEvents(group, scope) {
    //   addStandardEventHandlers(group, scope);
    //   addCursorEventHandlers(group, scope);
    //   var termObj = group.find('.termDrop')[0];
    //   setDroppable(termObj, ['ValueSet', 'Term']);
    //   addConnectionHandler(group.find('.leftConnector')[0], scope);
    //   addConnectionHandler(group.find('.rightConnector')[0], scope);
    //   connectConnectorEvents(group);
    // }

    // function associateQDMDataElementReferences(group, scope) {
    //   associateGenericElementReferences(group, scope);
    // }

     function createQDMDataElement(config, scope) {
    //   var options = {
    //       x: 0, y: 0, width: 175, height: 200,
    //       fill: '#dbeef4', name: 'mainRect',
    //       stroke: 'black', strokeWidth: 1
    //   };

    //   var group = new Kinetic.PhemaGroup({
    //     draggable: true,
    //     x: ((config && config.x) ? config.x : 50),
    //     y: ((config && config.y) ? config.y : 50)});

    //   var workflowObj = createRectangle(options, group);

    //   var headerOptions = {
    //       x: options.x, y: options.y,
    //       width: options.width, // Leave out height so it auto-sizes
    //       fontFamily: 'Calibri', fontSize: 14, fill: 'black',
    //       text: config.element.name,
    //       align: 'center', padding: 5
    //   };
    //   var headerObj = createText(headerOptions, group);

    //   var termDropOptions = {
    //     x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
    //     width: options.width - 20, height: 75,
    //     fill: '#EEEEEE', name: 'termDrop',
    //     stroke: '#CCCCCC', strokeWidth: 1
    //   };
    //   var termObj = createRectangle(termDropOptions, group);

    //   var termTextOptions = {
    //     x: termDropOptions.x, y: termDropOptions.y,
    //     width: termObj.width(), height: termObj.height(),
    //     fontFamily: 'Calibri', fontSize: 14, fill: 'gray',
    //     text: 'Drag and drop clinical terms or value sets here, or search for terms',
    //     align: 'center', padding: 5
    //   };
    //   createText(termTextOptions, group);

    //   var configOptions = {
    //     x: termDropOptions.x, y: termObj.height() + termDropOptions.y + 5,
    //     width: termDropOptions.width, height: termDropOptions.height,
    //     fill: '#EEEEEE',
    //     stroke: '#CCCCCC', strokeWidth: 1
    //   };
    //   var configObj = createRectangle(configOptions, group);

    //   // Resize the main container to ensure consistent spacing regardless of the
    //   // height of internal components.
    //   workflowObj.setHeight(configObj.getY() + configObj.getHeight() - options.y + 10);

    //   addConnectors(scope, workflowObj, group);

    //   connectQDMDataElementEvents(group, scope);

    //   // Now that the shape is built, define the bounds of the group
    //   group.setWidth(workflowObj.getWidth());
    //   group.setHeight(workflowObj.getHeight());

    //   var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
    //   mainLayer.add(group);
    //   mainLayer.draw();

    //   return group;
      var element = new DataElement();
      element.create(config, scope);
      return element.container();
    }

    // // Connects the appropriate QDM temporal operator shapes to event handlers.
    // // Used when constructing a new element, or when loading from a definition.
    // function connectQDMTemporalOperatorEvents(group, scope) {
    //   var allowedTemporalDropTypes = ['Category', 'DataElement', 'LogicalOperator', 'Phenotype'];
    //   addStandardEventHandlers(group, scope);
    //   addCursorEventHandlers(group, scope);
    //   setDroppable(group.find('.eventA')[0], allowedTemporalDropTypes);
    //   setDroppable(group.find('.eventB')[0], allowedTemporalDropTypes);
    //   addConnectionHandler(group.find('.leftConnector')[0], scope);
    //   addConnectionHandler(group.find('.rightConnector')[0], scope);
    //   addConnectionHandler(group.find('.leftConnector')[1], scope);
    //   addConnectionHandler(group.find('.rightConnector')[1], scope);
    //   connectConnectorEvents(group);
    // }

    // function associateQDMTemporalOperatorReferences(group, scope) {
    //   associateGenericElementReferences(group, scope);
    // }

    function createQDMTemporalOperator(config, scope) {
      // var group = new Kinetic.PhemaGroup({
      //   draggable: true,
      //   x: ((config && config.x) ? config.x : 50),
      //   y: ((config && config.y) ? config.y : 50)});
      // var spacing = 75;

      // var options = {
      //     x: 0, y: 0, width: 175, height: 175,
      //     fill: 'white', name: 'eventA',
      //     stroke: 'gray', strokeWidth: 1
      // };
      // var eventA = createRectangle(options, group);
      // eventA.dash([10, 5]);
      // eventA.dashEnabled(true);

      // var eventAConnectors = addConnectors(scope, eventA, group);

      // var headerOptions = {
      //     x: options.x, y: options.y,
      //     width: options.width, // Leave out height so it auto-sizes
      //     fontFamily: 'Calibri', fontSize: 18, fill: 'black',
      //     text: 'Event A', name: 'eventALabel',
      //     align: 'center', padding: 5
      // };
      // var eventAText = createText(headerOptions, group);
      // createText({
      //   x: eventAText.getX(), y: eventAText.getY() + eventAText.getHeight() + 25,
      //   width: options.width, // Leave out height so it auto-sizes
      //   fontFamily: 'Calibri', fontSize: 14, fill: 'black', name: 'eventAText',
      //   text: '(Drag and drop a data element here to define the event)',
      //   align: 'center', padding: 5}, group);

      // options.x = options.x + options.width + spacing;
      // options.name = 'eventB';
      // var eventB = createRectangle(options, group);
      // eventB.dash([10, 5]);
      // eventB.dashEnabled(true);

      // var eventBConnectors = addConnectors(scope, eventB, group);

      // headerOptions.x = options.x;
      // headerOptions.y = options.y;
      // headerOptions.text = 'Event B';
      // headerOptions.name = 'eventBLabel';
      // var eventBText = createText(headerOptions, group);
      // createText({
      //   x: eventBText.getX(), y: eventBText.getY() + eventBText.getHeight() + 25,
      //   width: options.width, // Leave out height so it auto-sizes
      //   fontFamily: 'Calibri', fontSize: 14, fill: 'black', name: 'eventBText',
      //   text: '(Drag and drop a data element here to define the event)',
      //   align: 'center', padding: 5}, group);

      // var stage = scope.canvasDetails.kineticStageObj;
      // startConnector(stage, eventAConnectors[1]);
      // var line = endConnector(stage, eventBConnectors[0], scope);
      // updateConnectedLines(eventAConnectors[1], stage);
      // if (line !== null) {
      //   line.label().setText(config.element.name);
      //   line.element(config.element);
      // }

      // connectQDMTemporalOperatorEvents(group, scope);

      // // Now that the shape is built, define the bounds of the group
      // group.setWidth(eventB.getX() + eventB.getWidth() - eventA.getX());
      // group.setHeight(eventA.getHeight());

      // var mainLayer = stage.find('#mainLayer');
      // mainLayer.add(group);
      // mainLayer.draw();
      // return group;
      var element = new TemporalOperator();
      element.create(config, scope);
      return element.container();
    }

    // // Connects the appropriate QDM logical operator shapes to event handlers.
    // // Used when constructing a new element, or when loading from a definition.
    // function connectQDMLogicalOperatorEvents(group, scope) {
    //   addStandardEventHandlers(group, scope);
    //   addCursorEventHandlers(group, scope);
    //   setDroppable(group.find('.mainRect')[0], ['Category', 'DataElement', 'LogicalOperator']);
    //   addConnectionHandler(group.find('.leftConnector')[0], scope);
    //   addConnectionHandler(group.find('.rightConnector')[0], scope);
    //   connectConnectorEvents(group);
    // }

    // function associateQDMLogicalOperatorReferences(group, scope) {
    //   associateGenericElementReferences(group, scope);
    // }

    function createQDMLogicalOperator(config, scope) {
      // var options = {
      //     x: 0, y: 0, width: 200, height: 200,
      //     fill: '#eeeeee', name: 'mainRect',
      //     stroke: 'gray', strokeWidth: 1
      // };

      // var group = new Kinetic.PhemaGroup({
      //   draggable: true,
      //   x: ((config && config.x) ? config.x : 50),
      //   y: ((config && config.y) ? config.y : 50),
      //   width: options.width, height: options.height });

      // var workflowObj = createRectangle(options, group);
      // workflowObj.dash([10, 5]);
      // workflowObj.dashEnabled(true);

      // var headerOptions = {
      //     x: options.x, y: options.y,
      //     width: options.width, // Leave out height so it auto-sizes
      //     fontFamily: 'Calibri', fontSize: 14, fill: 'black',
      //     text: config.element.name, name: 'header',
      //     align: 'center', padding: 5
      // };
      // createText(headerOptions, group);

      // addConnectors(scope, workflowObj, group);

      // connectQDMLogicalOperatorEvents(group, scope);

      // group.containedElements([]);
      // var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      // mainLayer.add(group);
      // mainLayer.draw();
      // return group;
      var element = new LogicalOperator();
      element.create(config, scope);
      return element.container();
    }

    // // Connects the appropriate generic element shapes to event handlers.
    // // Used when constructing a new element, or when loading from a definition.
    // function connectGenericElementEvents(group, scope) {
    //   addStandardEventHandlers(group, scope);
    //   addCursorEventHandlers(group, scope);
    //   addConnectionHandler(group.find('.leftConnector')[0], scope);
    //   addConnectionHandler(group.find('.rightConnector')[0], scope);
    //   connectConnectorEvents(group);
    // }

    // // When we load a saved phenotype definition, we have references to other elements.  This
    // // method goes through and associates those references back to actual elements.
    // function associateGenericElementReferences(group, scope) {
    //   var connections = scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection');
    //   group.find('PhemaConnector').each(function(connector) {
    //     var connectionRefs = connector.connections();
    //     var newConnections = [];
    //     for (var refIndex = 0; refIndex < connectionRefs.length; refIndex++) {
    //       for (var index = 0; index < connections.length; index++) {
    //         if (connections[index]._id === connectionRefs[refIndex].id) {
    //           newConnections.push(connections[index]);

    //           // We have a bi-directional reference between connectors and connections, so we
    //           // weill update the connector references here since we have estabilshed a connection.
    //           // Determine if I'm the start or the end of the connection
    //           var connectorRef = connections[index].connectors();
    //           if (connector._id === connectorRef.start.id) {
    //             connectorRef.start = connector;
    //           }
    //           else if (connector._id === connectorRef.end.id) {
    //             connectorRef.end = connector;
    //           }
    //           else {
    //             console.log('Invalid connection was found');
    //           }
    //           connections[index].connectors(connectorRef);
    //           break;
    //         }
    //       }
    //     }
    //     connector.connections(newConnections);
    //   });

    //   // Now, loop through all of the Connections and associate the appropriate Label with them
    //   var labels = scope.canvasDetails.kineticStageObj.mainLayer.find('Text');
    //   connections.each(function(connection) {
    //     var labelRef = connection.label();
    //     for (var labelIndex = 0; labelIndex < labels.length; labelIndex++) {
    //       if (labels[labelIndex]._id === labelRef.id) {
    //         connection.label(labels[labelIndex]);
    //         break;
    //       }
    //     }
    //   });
    // }

    function createGenericElement(config, scope) {
      // var options = {
      //     x: 0, y: 0, width: 175, height: 100,
      //     fill: '#dbeef4', name: 'mainRect',
      //     stroke: 'black', strokeWidth: 1
      // };

      // var group = new Kinetic.PhemaGroup({
      //   draggable: true,
      //   x: ((config && config.x) ? config.x : 50),
      //   y: ((config && config.y) ? config.y : 50)});
      // var workflowObj = createRectangle(options, group);

      // var headerOptions = {
      //     x: options.x, y: options.y,
      //     width: options.width, // Leave out height so it auto-sizes
      //     fontFamily: 'Calibri', fontSize: 14, fill: 'black',
      //     text: config.element.name,
      //     align: 'center', padding: 5
      // };
      // var headerObj = createText(headerOptions, group);

      // workflowObj.setHeight(headerObj.getHeight() + 30);

      // // Now that the shape is built, define the bounds of the group
      // group.setWidth(workflowObj.getWidth());
      // group.setHeight(workflowObj.getHeight());

      // addConnectors(scope, workflowObj, group);

      // connectQDMLogicalOperatorEvents(group, scope);

      // var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      // mainLayer.add(group);
      // mainLayer.draw();
      // return group;

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
        //workflowObject.element = config.element;
        //workflowObject._setAttr('sophe-element', config.element);
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
          //connectQDMTemporalOperatorEvents(group, scope);
          //associateQDMTemporalOperatorReferences(group, scope);
        }
        else if (element.type === 'DataElement' || element.type === 'Category') {
          var dataElement = new DataElement();
          dataElement.load(group, scope);
          //connectQDMDataElementEvents(group, scope);
          //associateQDMDataElementReferences(group, scope);
        }
        else if (element.type === 'LogicalOperator') {
          var logicalOperator = new LogicalOperator();
          logicalOperator.load(group, scope);
          //connectQDMLogicalOperatorEvents(group, scope);
          //associateQDMLogicalOperatorReferences(group, scope);
        }
        else if (element.type === 'Phenotype') {
          var phenotype = new GenericElement();
          phenotype.load(group, scope);
          // connectGenericElementEvents(group, scope);
          // associateGenericElementReferences(group, scope);
        }
        else {
          var genericElement = new GenericElement();
          genericElement.load(group, scope);
          // connectGenericElementEvents(group, scope);
          // associateGenericElementReferences(group, scope);
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

    //factory.allowsDrop = allowsDrop;

    return factory;
});