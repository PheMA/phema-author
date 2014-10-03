(function() {
    'use strict';
    angular.module('sophe.kinetic', [])
    .directive('kineticCanvas', ['$rootScope',
    function canvasDirective ($rootScope) {
        return {
            restrict: 'A',
            scope: {
                // isdraggable: '=',
                // kineticStageObj: '=',
                canvasDetails: '=',
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
                }
                // var layer = new Kinetic.Layer();
                // var rectX = scope.kineticStageObj.getWidth() / 2 - 50;
                // var rectY = scope.kineticStageObj.getHeight() / 2 - 25;

                // //if kineticObj is null, init
                // var options = {
                //     x: rectX,
                //     y: rectY,
                //     width: 100,
                //     height: 50,
                //     fill: '#00D2FF',
                //     stroke: 'black',
                //     strokeWidth: 4,
                // };
                // if (scope.isdraggable) {
                //     options.draggable = true;
                // }
                // if (!scope.kineticObj) {
                //     scope.kineticObj = new Kinetic.Rect(options);
                // }

                // // add cursor styling
                // scope.kineticObj.on('mouseover', function () {

                //     document.body.style.cursor = 'pointer';

                // });
                // scope.kineticObj.on('mouseout', function () {
                //     document.body.style.cursor = 'default';
                //     $rootScope.$emit('CANVAS-MOUSEOUT');
                // });

                // layer.add(scope.kineticObj);
                // scope.kineticStageObj.add(layer);
            }
        };
    }]);
})();