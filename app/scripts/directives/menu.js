(function() {
    'use strict';
    angular.module('sophe-menu', [])
    .directive('authorMenu', ['$rootScope',
    function menuDirective ($rootScope) {
        return {
            restrict: 'A',
            scope: {
            },
            link: function(scope, element, attrs) {
            }
        };
    }]);
})();