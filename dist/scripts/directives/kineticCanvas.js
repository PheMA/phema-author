/* globals $ */

(function() {
  'use strict';
  angular.module('sophe.kinetic', [])
  .directive('kineticCanvas', ['$window', 'kineticStageFactory', function ($window, kineticStageFactory) {
    return {
      restrict: 'A',
      scope: {
        canvasDetails: '=',
        connectionStatus: '='
      },
      link: function(scope, element, attrs) {
        kineticStageFactory.create(scope, attrs);

        scope.initialElementHeight = $(element).height();
        scope.initialWindowHeight = $window.innerHeight;

        // Our KineticJS canvas has containing DIV elements and so we use this recursive function
        // to size everything to the same dimensions.
        var resizeElementAndChildren = function(element, width, height) {
          var children = $(element).children();
          for (var index = 0; index < children.length; index++) {
            resizeElementAndChildren(children[index], width, height);
          }

          // Setting both CSS style dimensions and HTML element dimensions.  This ensures the
          // canvas is resized and doesn't try to scale existing elements to the new dimensions.
          $(element).height(height);
          $(element).width(width);
          $(element)[0].height = height;
          $(element)[0].width = width;
        };

        scope.onResize = function() {
          element.windowHeight = scope.initialElementHeight + ($window.innerHeight - scope.initialWindowHeight) + 5;
          element.windowWidth = $window.innerWidth - $(element).offset().left - 20;
          resizeElementAndChildren(element, element.windowWidth, element.windowHeight);

          // Fully redraw everything after sizing is done.  A simple draw() won't cut it.  Note that
          // we have to update the stage size, otherwise it will retain its original size.
          if (scope.canvasDetails.kineticStageObj) {
            scope.canvasDetails.kineticStageObj.setWidth(element.windowWidth);
            scope.canvasDetails.kineticStageObj.setHeight(element.windowHeight);
            scope.canvasDetails.kineticStageObj.drawScene();
          }
        };
        scope.onResize();

        angular.element($window).bind('resize', function() {
          scope.onResize();
        });

        scope.$root.$broadcast('sophe-canvas-loaded', null);
      }
    };
  }]);
})();