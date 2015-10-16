'use strict';

/* exported beforeUnloadFactory */

// This code is from: https://gist.github.com/schmuli/8781415#file-example-html
angular.module('sophe.factories.window', [])
  .factory('beforeUnloadFactory', function($rootScope, $window) {
    // Events are broadcast outside the Scope Lifecycle
    $window.onbeforeunload = function () {
        var confirmation = {};
        var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
        if (event.defaultPrevented) {
            return confirmation.message;
        }
    };
    
    $window.onunload = function () {
        $rootScope.$broadcast('onUnload');
    };
    return {};
})
.run(function (beforeUnloadFactory) {
    // Must invoke the service at least once
    var tmp = beforeUnloadFactory;
    return tmp;
});
