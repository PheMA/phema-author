/* globals updateActiveLineLocation, endConnector, clearSelections, Kinetic */

(function() {
    'use strict';
    angular.module('sophe.kinetic', [])
    .directive('kineticCanvas', ['kineticStageFactory',
    function canvasDirective (kineticStageFactory) {
        return {
            restrict: 'A',
            scope: {
                canvasDetails: '=',
                connectionStatus: '='
            },
            link: function(scope, element, attrs) {
                kineticStageFactory.create(scope, attrs);
            }
        };
    }]);
})();