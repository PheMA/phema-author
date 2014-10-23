(function() {
    'use strict';
    angular.module('sophe.kinetic', [])
    .directive('kineticCanvas', ['$rootScope',
    function canvasDirective ($rootScope) {
        function updateActiveLineLocation(stage, evt) {
          var x = evt.evt.layerX;
          var y = evt.evt.layerY;
          stage.activeLine.points([0, 0, x - stage.activeLine.getX(), y - stage.activeLine.getY()]);
          stage.activeLine.parent.drawScene();
        }

        return {
            restrict: 'A',
            scope: {
                // isdraggable: '=',
                // kineticStageObj: '=',
                canvasDetails: '=',
                connectionStatus: '='
            },
            link: function(scope, element, attrs) {
                if (!scope.canvasDetails) {
                    scope.canvasDetails = {isdraggable: true, kineticStageObj: null};
                    var id = attrs.id;
                    //create random unique id
                    if (!id) {
                        id = Math.random().toString(36).substring(7);
                    }
                    if (!scope.canvasDetails.kineticStageObj) {
                        scope.canvasDetails.kineticStageObj = new Kinetic.Stage({
                            container: id,
                            width: 600,
                            height: 400
                        });
                    }
                    if (!scope.canvasDetails.kineticStageObj.container) {
                        scope.canvasDetails.kineticStageObj.attrs.container = id;
                    }

                    // Set up a rectangle on its own layer, which will listen for mouse events for us.
                    var stage = scope.canvasDetails.kineticStageObj;
                    var backgroundLayer = new Kinetic.Layer();
                    stage.add(backgroundLayer);
                    stage.backgroundLayer = backgroundLayer;

                    var background = new Kinetic.Rect({
                      x: 0,
                      y: 0,
                      width: stage.getWidth(),
                      height: stage.getHeight(),
                      fill: 'white',
                      stroke: 'white',
                      strokeWidth: 1,
                    });
                    backgroundLayer.add(background);
                    backgroundLayer.draw();

                    background.on('mousemove', function(evt) {
                      if (stage.connectionStatus === 'drawing') {
                        updateActiveLineLocation(stage, evt);
                      }
                    });

                    background.on('mouseup', function(evt) {
                      if (stage.connectionStatus === 'drawing') {
                        // We didn't end the connection at a drop point, so delete the line we were drawing
                        var layer = stage.activeLine.parent;
                        layer.destroyChildren();
                        layer.destroy();
                        stage.connectionStatus = undefined;
                        stage.activeLine = undefined;
                      }
                    });
                }
            }
        };
    }]);
})();