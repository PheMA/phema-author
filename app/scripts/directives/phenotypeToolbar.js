'use strict';

angular.module('sophe.phenotype.toolbar', [])
  .directive('phenotypeToolbar', [function() {
  var directive = {
    templateUrl: 'views/phenotypes/toolbar.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope) {
      $scope.buttons = [
        {text: 'Save', iconClass:'fa fa-save'},
        {text: 'Export', iconClass:'fa fa-arrow-circle-down'},
        {spacer: true},
        {text: 'Copy', iconClass:'fa fa-copy'},
        {text: 'Paste', iconClass:'fa fa-paste'},
        {text: 'Undo', iconClass:'fa fa-undo'},
        {text: 'Redo', iconClass:'fa fa-repeat'}
      ];
    }
  };
  return directive;
}]);