'use strict';

var mod = angular.module('phekb', ['ngCookies']);
var phekb_url = "http://local.phekb.org";
function htmlToPlaintext(text) {
  return text ? String(text).replace(/<[^>]+>/gm, '') : '';
}

mod.controller('PhekbController', ['$scope', 'security', '$http', '$rootScope', '$cookies',function($scope, security, $http, $rootScope, $cookies) {
  // The model for this form 
  var user = security.currentUser;
  $scope.user = user;
  $scope.path = '';
  var session = $cookies.session; 
  $scope.msg = "Enter path to hit Phekb and show a response";
  $scope.data = "Response data  will be shown here"

  $scope.paths = ['user/'+user.uid];

  $scope.getPhekb = function getPhekb()
  {
    console.log("submitted getPhekb");
    if ($scope.user && $scope.path)
    {
      console.log("Hitting phekb");
      var request = $http.post('/phekb-resource', { session: $scope.user.session, path: $scope.path, uid: $scope.user.uid});
      request.then(function(response) {
        $scope.msg = "Hello this was from the then";
        console.log($scope.msg);
        $scope.data = response.data;
     }, function(error) {
      console.log("error");
      $scope.msg = error;
     });
    }
    else
    {
      console.log("Error hitting phekb ", error);
      $scope.msg = "Login First ";
    }

  }
}]);


mod.controller('PhekbEntryController', ['$scope', 'security', '$http', '$rootScope', '$routeParams', '$location', '$cookies', 'LibraryService',
  function($scope, security, $http, $rootScope, $routeParams, $location, $cookies, LibraryService) {
  // The model for this form 
  var user = security.currentUser;
  $scope.user = user;
  $scope.path = '';
  var session = $cookies.session; 
  $scope.msg = "Enter path to hit Phekb and show a response";
  
  console.log($routeParams)
  var args = $location.search();
  console.log(args);
  $scope.data = "Args: sess_id : " + args.sess_id + " uid : " + args.uid + " nid: " + args.nid + " id : " + args.id ; 
  
  if (args.action == 'edit' ){
    if (args.id) {

      $location.path('/phenotype/'+args.id);
    }
    else {
      var external = { nid: args.nid, uid: args.uid, site: args.site, url: phekb_url + "/phenotype/" + args.nid };
      // Luke: external object in phekb is not getting passed through to library for some reason . 
      var phenotype = {phekb: true, modifiedBy: user.email, createdBy: user.email, name: args.title, description: args.description,
      external: external };  //nid: args.nid, uid: args.uid, site: args.site };
      LibraryService.saveDetails(phenotype)
        .then(function(data) {
          $location.path('/phenotype/' + data.id);
        }, function() {
          $scope.errorMessage = 'There was an error trying to save your phenotype definition and launch the authoring tool';
        });
      
    }

  }
/*
  $scope.getPhekb = function getPhekb()
  {
    console.log("submitted getPhekb");
    if ($scope.user && $scope.path)
    {
      console.log("Hitting phekb");
      var request = $http.post('/phekb-resource', { session: $scope.user.session, path: $scope.path, uid: $scope.user.uid});
      request.then(function(response) {
        $scope.msg = "Hello this was from the then";
        console.log($scope.msg);
        $scope.data = response.data;
     }, function(error) {
      console.log("error");
      $scope.msg = error;
     });
    }
    else
    {
      console.log("Error hitting phekb ", error);
      $scope.msg = "Login First ";
    }

  }
  */
}]);



