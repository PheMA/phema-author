/* global Kinetic */

'use strict';

function updateStrokeWidth(kineticObj, normal) {
  var strokeWidth = kineticObj.originalStrokeWidth || 1;
  if (!normal) {
    strokeWidth = strokeWidth + 2;
  }

  if ('Group' === kineticObj.nodeType) {
    var mainRect = kineticObj.find('.mainRect')[0];
    if (mainRect) {
      mainRect.setStrokeWidth(strokeWidth);
    }
  }
  //else if ('Line' === kineticObj.className) {
  //  kineticObj.setStrokeWidth(strokeWidth);
  //}
  else {
    kineticObj.setStrokeWidth(strokeWidth);
  }
}

function selectObject(stage, selectObj) {
  if (stage.connector && stage.connector.status === 'drawing') {
    return;
  }
  selectObj.selected = true;
  updateStrokeWidth(selectObj, false);
  stage.draw();
}

function clearSelections(stage) {
  var layer = stage.find('#mainLayer')[0];
  var counter = 0;
  var children = layer.getChildren();
  for (counter = 0; counter < children.length; counter++) {
    children[counter].selected = false;
    updateStrokeWidth(children[counter], true);
  }
  stage.draw();
}

// Provide the "outline" effect for objects when you move the mouse
// over them.
function addOutlineStyles(kineticObj, originalWidth) {
  var normalWidth = (originalWidth || 1);
  kineticObj.on('mouseover', function (e) {
    if (!e.target.selected) {
      e.target.setStrokeWidth(normalWidth + 2);
      e.target.getParent().draw();
    }
  });
  kineticObj.on('mouseout', function (e) {
    if (!e.target.selected) {
      e.target.setStrokeWidth(normalWidth);
      e.target.getParent().draw();
    }
  });
}

// Update a connector line so that it is drawn between a start position and an
// end position.
function changeConnectorEndpoints(stage, line, startPos, endPos) {
  var x = endPos.x;
  var y = endPos.y;
  line.points([0, 0, x - startPos.x, y - startPos.y]);

  // Arrow head: http://jsfiddle.net/cmcculloh/M56w4/
  var fromx = 0;
  var fromy = 0;
  var tox = x - startPos.x;
  var toy = y - startPos.y;
  var headlen = 15;
  var angle = Math.atan2(toy-fromy,tox-fromx);
  line.points(
    [fromx,
     fromy,
     tox,
     toy,
     tox-headlen*Math.cos(angle-Math.PI/6),
     toy-headlen*Math.sin(angle-Math.PI/6),
     tox,
     toy,
     tox-headlen*Math.cos(angle+Math.PI/6),
     toy-headlen*Math.sin(angle+Math.PI/6)]
  );
}

// Responding to a mouse move event, update the current connector line that is being drawn
// to end at the cursor.
function updateActiveLineLocation(stage, evt) {
  if (stage.connector.status === 'drawing') {
    var startPos = {x: stage.connector.line.getX(), y: stage.connector.line.getY()};
    var endPos = {x: evt.evt.layerX, y: evt.evt.layerY};
    changeConnectorEndpoints(stage, stage.connector.line, startPos, endPos);
    stage.drawScene();
  }
}

// Start a connector line, anchored at a connector object
function startConnector(stage, connectorObj) {
  var line = new Kinetic.Line({
    x: stage.getPointerPosition().x,
    y: stage.getPointerPosition().y,
    points: [0, 0],
    stroke: 'black', strokeWidth: 2
  });
  line.connectors = {};
  line.connectors.start = connectorObj;
  line.originalStrokeWidth = 2;
  addOutlineStyles(line, 2);

  stage.find('#mainLayer').add(line);
  line.setZIndex(999);  // Should be on top
  stage.connector.status = 'drawing';
  stage.connector.line = line;
  line.parent.draw();
  stage.connector.anchor = connectorObj;
  connectorObj.getParent().draggable(false);
}

// For a line in progress, end the line at the given connector.  If no connector is present,
// or the connector isn't valid, remove the in progress line.
function endConnector(stage, connectorObj) {
  if (stage.connector.status === 'drawing') {
    // If we are dropping where we started, or there is no end connection point, the line
    // is invalid and we will just clear it
    if (stage.connector.anchor === connectorObj || ('undefined' === typeof connectorObj)) {
      //var group = stage.connector.line.parent;
      //group.destroyChildren();
      //group.destroy();
      stage.connector.line.destroy();
    }
    // Otherwise we have a valid line.  Update the internal collections tracking how objects
    // are related.
    else {
      stage.connector.line.connectors.end = connectorObj;
      connectorObj.connections.push(stage.connector.line);
      stage.connector.line.connectors.start.connections.push(stage.connector.line);
      stage.connector.line.on('mouseup', function(e) {
        clearSelections(stage);
        selectObject(stage, e.target);
      });
    }
  }

  if ('undefined' !== typeof stage.connector.anchor) {
    stage.connector.anchor.getParent().draggable(true);
  }

  stage.connector = {};
  stage.drawScene();
}