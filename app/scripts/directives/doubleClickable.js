'use strict';
angular.module('sophe.doubleClickable', [])
  .directive('doubleClickable', function() {
  var directive = {
    restrict: 'A',
    scope: {
      dblclickEvent: '&' //parent
    },
    link: function($scope, $element) {
        var el = $element[0];
        el.addEventListener(
            'dblclick',
            function() {
              $scope.$apply(function(scope) {
                var fn = scope.dblclickEvent;
                if ('undefined' !== typeof fn) {
                  var configParam = {config: {x: 0, y: 0, element: JSON.parse(el.getElementsByTagName('input')[0].value) }};
                  fn(configParam);
                }
              });
              return false;
            },
            false
        );
    }
  };
  return directive;
});