'use strict';
angular.module('sophe.droppable', [])
  .directive('droppable', function() {
  var directive = {
    restrict: 'A',
    scope: {
      drop: '&' //parent
    },
    link: function($scope, $element) {
      // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
      // this gives us the native JS object
      var el = $element[0];

      el.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';
          // allows us to drop
          if (e.preventDefault) {
            e.preventDefault();
          }
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragenter',
        function() {
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragleave',
        function() {
          this.classList.remove('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'drop',
        function(e) {
          // Stops some browsers from redirecting.
          if(e.preventDefault) { e.preventDefault(); }
          if(e.stopPropagation) { e.stopPropagation(); }

          this.classList.remove('over');

          $scope.$apply(function(scope) {
            var fn = scope.drop;
            if ('undefined' !== typeof fn) {
              var configParam = {config: {x: e.layerX, y: e.layerY, element: JSON.parse(e.dataTransfer.getData('Text')) }};
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