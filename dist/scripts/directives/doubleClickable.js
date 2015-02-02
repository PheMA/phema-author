'use strict';
angular.module('sophe.doubleClickable', [])
  .directive('doubleClickable', function() {
  var directive = {
    restrict: 'A',
    scope: {
      dblclickEvent: '&' //parent
    },
    link: function($scope, $element) {
      $element.bind('dblclick',
        function() {
          $scope.$apply(function(scope) {
            var fn = scope.dblclickEvent;
            if ('undefined' !== (typeof fn) && $element[0].getElementsByTagName('input')[0]) {
              var configParam = {config: {x: 0, y: 0, element: JSON.parse($element[0].getElementsByTagName('input')[0].value) }};
              fn(configParam);
            }
          });
          return false;
        });
    }
  };
  return directive;
});