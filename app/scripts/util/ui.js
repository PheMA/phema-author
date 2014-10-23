/* global Kinetic */

'use strict';
function updateActiveLineLocation(stage, evt) {
  if (stage.connectionStatus === 'drawing') {
    var x = evt.evt.layerX;
    var y = evt.evt.layerY;
    stage.activeLine.points([0, 0, x - stage.activeLine.getX(), y - stage.activeLine.getY()]);
    stage.activeLine.parent.drawScene();
  }
}

function startConnector(stage, connectorObj) {
  var layer = new Kinetic.Layer({draggable: true});
  var line = new Kinetic.Line({
    x: stage.getPointerPosition().x,
    y: stage.getPointerPosition().y,
    points: [0, 0],
    stroke: 'black', strokeWidth: 1
  });
  layer.add(line);
  stage.add(layer);
  layer.setZIndex(999);  // Should be on top
  stage.connectionStatus = 'drawing';
  stage.activeLine = line;
  line.parent.draw();
  stage.connectionAnchor = connectorObj;
  connectorObj.getLayer().draggable(false);
}

function endConnector(stage, connectorObj) {
  if (stage.connectionStatus === 'drawing' &&
    (stage.connectionAnchor === connectorObj || ('undefined' === typeof connectorObj))) {
    var layer = stage.activeLine.parent;
    layer.destroyChildren();
    layer.destroy();
  }

  if ('undefined' !== typeof stage.connectionAnchor) {
    stage.connectionAnchor.getLayer().draggable(true);
  }

  stage.connectionStatus = undefined;
  stage.activeLine = undefined;
  stage.connectionAnchor = undefined;
}