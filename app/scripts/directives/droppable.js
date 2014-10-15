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
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'drop',
        function(e) {
          // Stops some browsers from redirecting.
          if (e.stopPropagation) {
            e.stopPropagation();
          }

          this.classList.remove('over');

          //var item = document.getElementById(e.dataTransfer.getData('Text'));
          //this.appendChild(item);

          //$scope.$apply('drop()');
          $scope.$apply(function(scope) {
            var fn = scope.drop;
            if ('undefined' !== typeof fn) {
              fn(e);
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