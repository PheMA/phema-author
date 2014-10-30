/* global Kinetic */

'use strict';
function updateActiveLineLocation(stage, evt) {
  if (stage.connector.status === 'drawing') {
    var startPos = {x: stage.connector.line.getX(), y: stage.connector.line.getY()};
    var endPos = {x: evt.evt.layerX, y: evt.evt.layerY};
    changeLineEndpoints(stage, stage.connector.line, startPos, endPos);
    // var x = evt.evt.layerX;
    // var y = evt.evt.layerY;
    // stage.connector.line.points([0, 0, x - stage.connector.line.getX(), y - stage.connector.line.getY()]);

    // // Arrow head: http://jsfiddle.net/cmcculloh/M56w4/
    // var fromx = 0;
    // var fromy = 0;
    // var tox = x - stage.connector.line.getX();
    // var toy = y - stage.connector.line.getY();
    // var headlen = 15;
    // var angle = Math.atan2(toy-fromy,tox-fromx);
    // stage.connector.line.points(
    //   [fromx,
    //    fromy,
    //    tox,
    //    toy,
    //    tox-headlen*Math.cos(angle-Math.PI/6),
    //    toy-headlen*Math.sin(angle-Math.PI/6),
    //    tox,
    //    toy,
    //    tox-headlen*Math.cos(angle+Math.PI/6),
    //    toy-headlen*Math.sin(angle+Math.PI/6)]
    // );

    stage.drawScene();
  }
}

function changeLineEndpoints(stage, line, startPos, endPos) {
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

function startConnector(stage, connectorObj) {
  //var group = new Kinetic.Group({draggable: true});
  var line = new Kinetic.Line({
    x: stage.getPointerPosition().x,
    y: stage.getPointerPosition().y,
    points: [0, 0],
    stroke: 'black', strokeWidth: 2
  });
  line.connectors = {};
  line.connectors.start = connectorObj;

  //group.add(line);
  //stage.find('#mainLayer').add(group);
  stage.find('#mainLayer').add(line);
  //group.setZIndex(999);  // Should be on top
  line.setZIndex(999);  // Should be on top
  stage.connector.status = 'drawing';
  stage.connector.line = line;
  line.parent.draw();
  stage.connector.anchor = connectorObj;
  connectorObj.getParent().draggable(false);
}

function endConnector(stage, connectorObj) {
  if (stage.connector.status === 'drawing') {
    // If we are dropping where we started, or there is no end connection point, the line
    // is invalid and we will just clear it
    if (stage.connector.anchor === connectorObj || ('undefined' === typeof connectorObj)) {
      var group = stage.connector.line.parent;
      group.destroyChildren();
      group.destroy();
    }
    // Otherwise we have a valid line.  Update the internal collections tracking how objects
    // are related.
    else {
      stage.connector.line.connectors.end = connectorObj;
      connectorObj.connections.push(stage.connector.line);
      stage.connector.line.connectors.start.connections.push(stage.connector.line);
    }
  }

  if ('undefined' !== typeof stage.connector.anchor) {
    stage.connector.anchor.getParent().draggable(true);
  }

  // stage.connectionStatus = undefined;
  // stage.activeLine = undefined;
  // stage.connectionAnchor = undefined;
  stage.connector = {};
  stage.drawScene();
}