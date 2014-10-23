/* global Kinetic */

'use strict';
function updateActiveLineLocation(stage, evt) {
  if (stage.connectionStatus === 'drawing') {
    var x = evt.evt.layerX;
    var y = evt.evt.layerY;
    stage.activeLine.points([0, 0, x - stage.activeLine.getX(), y - stage.activeLine.getY()]);

    // Arrow head: http://jsfiddle.net/cmcculloh/M56w4/
    var fromx = 0;
    var fromy = 0;
    var tox = x - stage.activeLine.getX();
    var toy = y - stage.activeLine.getY();
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);
    stage.activeLine.points(
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