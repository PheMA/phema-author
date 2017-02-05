/* globals $, resizeStageForEvent */

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
      link: function(scope, canvasElement, attrs) {
        kineticStageFactory.create(scope, attrs);

        var footerHeight = $('.footer').height();
        var headerHeight = $('.header').height();
        var containerElement = $(canvasElement).closest('.phenotype-canvas');

        // Our KineticJS canvas has containing DIV elements and so we use this recursive function
        // to size everything to the same dimensions.  Note that we don't do canvas elements since
        // that is hidden by a later call to resizeStageForEvent (from performResizeToElementSize)
        var resizeElementAndChildren = function(element, width, height) {
          var children = element.children().not('canvas');
          for (var index = 0; index < children.length; index++) {
            resizeElementAndChildren($(children[index]), width, height);
          }

          // Setting both CSS style dimensions and HTML element dimensions.  This ensures the
          // canvas is resized and doesn't try to scale existing canvasElements to the new dimensions.
          element.height(height);
          element.width(width);
          element[0].height = height;
          element[0].width = width;
        };

        var performResizeToElementSize = function(element) {
          resizeElementAndChildren(element, element.width(), element.height());
          var stage = scope.canvasDetails.kineticStageObj;
          resizeStageForEvent(stage, {width: element.width(), height: element.height()}, null);
        };

        scope.onResize = function() {
          var containerHeight = $window.innerHeight - containerElement.offset().top - footerHeight - headerHeight - 70;
          var containerWidth = $window.innerWidth - containerElement.offset().left - 40;
          containerElement.height(containerHeight);
          containerElement.width(containerWidth);
          performResizeToElementSize(containerElement);
        };

        scope.onResize();

        angular.element($window).bind('resize', function() {
          scope.onResize();
        });
      }
    };
  }]);
})();