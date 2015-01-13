/* globals $ */

(function() {
  'use strict';
  angular.module('sophe.kinetic', [])
  .directive('kineticCanvas', ['$window', 'kineticStageFactory',
  function canvasDirective ($window, kineticStageFactory) {
    return {
      restrict: 'A',
      scope: {
        canvasDetails: '=',
        connectionStatus: '=',
        minimumWidth: '=',
        minimumHeight: '='
      },
      link: function(scope, element, attrs) {
        kineticStageFactory.create(scope, attrs);

        // Derived from http://stackoverflow.com/questions/23044338/window-resize-directive
        scope.initialElementWidth = $(element).width();
        scope.initialElementHeight = $(element).height();
        scope.initialWindowWidth = $window.innerWidth;
        scope.initialWindowHeight = $window.innerHeight;
        console.log(scope.initialElementHeight);

        var resizeElementAndChildren = function(element, width, height) {
          var children = $(element).children();
          for (var index = 0; index < children.length; index++) {
            resizeElementAndChildren(children[index], width, height);
          }
          //if ($(element)[0].tagName !== 'CANVAS') {
            $(element).height(height);
            $(element).width(width);
            $(element)[0].height = height;
            $(element)[0].width = width;
            console.log($(element)[0].tagName);
          //}
        };

        scope.onResize = function() {
          element.windowHeight = scope.initialElementHeight + ($window.innerHeight - scope.initialWindowHeight) - 5;
          element.windowWidth = scope.initialElementWidth + ($window.innerWidth - scope.initialWindowWidth) - 5;
          element.windowHeight = Math.max(element.windowHeight, scope.minimumHeight);
          element.windowWidth = Math.max(element.windowWidth, scope.minimumWidth);
          $(element).height(element.windowHeight);
          $(element).width(element.windowWidth);
          resizeElementAndChildren(element, element.windowWidth, element.windowHeight);
          if (scope.canvasDetails.kineticStageObj) {
            scope.canvasDetails.kineticStageObj.drawScene();
          }
        };
        scope.onResize();

        angular.element($window).bind('resize', function() {
          scope.onResize();
        });
      }
    };
  }]);
})();