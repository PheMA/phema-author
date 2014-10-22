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
            }
        };
    }]);
})();