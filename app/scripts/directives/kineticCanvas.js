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
        rightAlignTo: '@'
      },
      link: function(scope, element, attrs) {
        kineticStageFactory.create(scope, attrs);

        //scope.minimumHeight = scope.minimumHeight || 0;
        //scope.minimumWidth = scope.minimumWidth || 0;

        // Derived from http://stackoverflow.com/questions/23044338/window-resize-directive
        // scope.initialElementWidth = $(element).width();
        // scope.initialElementHeight = $(element).height();
        // scope.initialWindowWidth = $window.innerWidth;
        // scope.initialWindowHeight = $window.innerHeight;

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
          element.windowHeight = scope.initialElementHeight + ($window.innerHeight - scope.initialWindowHeight) - 5;
          //element.windowWidth = scope.initialElementWidth + ($window.innerWidth - scope.initialWindowWidth) - 5;
          element.windowWidth = $('#' + scope.rightAlignTo).width() - $(element).offset().left + $('#' + scope.rightAlignTo).offset().left;
          //element.windowHeight = Math.max(element.windowHeight, scope.minimumHeight);
          //element.windowWidth = Math.max(element.windowWidth, scope.minimumWidth);
          $(element).height(element.windowHeight);
          $(element).width(element.windowWidth);
          resizeElementAndChildren(element, element.windowWidth, element.windowHeight);
          // Fully redraw everything after sizing is done.  A simple draw() won't cut it.
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