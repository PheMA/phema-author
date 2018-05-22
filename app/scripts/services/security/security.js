//----------------------------------------------------------------------------------------
// Add new security services here.  In the appropriate config/*.json, specify the right
// value of authenticationType to use to call your service.
//----------------------------------------------------------------------------------------
// Approach to dynamic dependency injection is from: 
// http://phonegap-tips.com/articles/conditional-dependency-injection-with-angularjs.html

angular.module('security.service', [
  'security.service.stub',
  'security.service.local',
  'security.service.phekb'])
.factory('security', ['authenticationType', '$injector', function(authenticationType, $injector) {
  if (authenticationType === 'local') {
    return $injector.get('localSecurity');
  }
  else if (authenticationType === 'phekb') {
    return $injector.get('phekbSecurity');
  }
  else {
    return $injector.get('stubSecurity');
  }
}]);