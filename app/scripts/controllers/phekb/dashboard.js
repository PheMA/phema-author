'use strict';

var mod = angular.module('phekb', ['ngCookies', 'sophe.config']);

function htmlToPlaintext(text) {
  return text ? String(text).replace(/<[^>]+>/gm, '') : '';
}



mod.controller('PhekbDashboardController', ['$scope', 'security', '$http', '$rootScope', '$cookies', 'LibraryService', 'phekbUrl', 'apiKey',
  function($scope, security, $http, $rootScope, $cookies, LibraryService, phekbUrl, apiKey) {

    console.log("phekbUrl and apiKey from config: " + phekbUrl + "  " + apiKey);
    /* Utility function to take phenotype from phekb and add it to the local library where it can be edited .
     * The local library will link the id to a node on phekb.org. This way all phekb.org needs to know is the id.
     */

    function phekb_add_to_local_lib(user, phenotype, $scope, LibraryService, i, ptype){
      var external = { nid: phenotype.nid, site: phekbUrl, url: phekbUrl + "/phenotype/" + phenotype.nid };
      var lib_pheno = {phekb: true, modifiedBy: user.email, createdBy: user.email, name: phenotype.title, description: phenotype.description,
      external: external, user : user};
      LibraryService.saveDetails(lib_pheno)
        .then(function(data) {
          //console.log("added phekb pheno to local lib : " + data.id);
          phenotype.id = data.id;
          if (ptype == 'group') {
            $scope.group_phenotypes[i] = phenotype;
          }
          else {
            $scope.phenotypes[i] = phenotype;
          }
        }, function(error) {
          console.log(error);
          // Todo
          //$scope.errors.push('There was an error saving your phenotype: ' + error);
        });
    }
  // The model for this form
  var user = security.currentUser;
  $scope.user = user;
  $scope.path = '';
  $scope.phenotypes = [];
  $scope.group_phenotypes = [];
  if (!$scope.user)
  {
    // Nothing to do
    return;
  }
  var session = $cookies.session;
  $scope.msg = "Phekb Phenotypes";
  // Get user's phenotypes
  var path = 'services/phenotypes/list';
  var request = $http.post('/api/user/resources', { session: session, path: path, uid: $scope.user.uid});
  request.then(function(response) {
    $scope.phenotypes = response.data;

    // Foreach phenotype that is not in the local library , add it so that editing is seemless and links back to phekb
    for (var i = $scope.phenotypes.length - 1; i >= 0; i--) {

      if ($scope.phenotypes[i].id == 0) {
        phekb_add_to_local_lib($scope.user, $scope.phenotypes[i], $scope, LibraryService, i, 'mine');
        //console.log("my adding to local lib")
      }
      else
      {
        //console.log("my NOT adding to local lib ");
      }
    };
  }, function(error) {
    console.log("error: ", error);
    $scope.msg = error;
  });

  // Get owner group phenotypes they can edit
  path = 'services/phenotypes/list-owner';
  var request = $http.post('/api/user/resources', { session: session, path: path, uid: $scope.user.uid});
  request.then(function(response) {
    $scope.group_phenotypes = response.data;

    // Foreach phenotype that is not in the local library , add it so that editing is seemless and links back to phekb
    for (var i = $scope.group_phenotypes.length - 1; i >= 0; i--) {

      if ($scope.group_phenotypes[i].id == 0) {
        //console.log(" group adding to local lib ");
        phekb_add_to_local_lib($scope.user, $scope.group_phenotypes[i], $scope, LibraryService, i, 'group');
      }
      else
      {
        //console.log("group NOT adding to local lib ");
      }
    };
  }, function(error) {
    console.log("error: ", error);
    $scope.errors.push(error);
  });

}]);
