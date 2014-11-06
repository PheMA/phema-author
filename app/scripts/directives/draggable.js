'use strict';
angular.module('sophe.draggable', [])
  .directive('draggable', function() {
  var directive = {
    restrict: 'A',
    link: function($scope, $element) {
        // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
        // this gives us the native JS object
        var el = $element[0];

        el.draggable = true;

        el.addEventListener(
            'dragstart',
            function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('Text', el.getElementsByTagName('input')[0].value);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function() {
                this.classList.remove('drag');
                return false;
            },
            false
        );
    }
  };
  return directive;
});