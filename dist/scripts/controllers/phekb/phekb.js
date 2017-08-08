'use strict';

var mod = angular.module('security.phekb', ['ngCookies', 'sophe.config']);

function htmlToPlaintext(text) {
  return text ? String(text).replace(/<[^>]+>/gm, '') : '';
}

mod.controller('PhekbController', ['$scope', 'security', '$http', '$rootScope', '$cookies', 'phekbUrl', 'apiKey',
  function($scope, security, $http, $rootScope, $cookies, $phekbUrl, $apiKey) {
  // The model for this form
  var user = security.currentUser;
  $scope.user = user;
  $scope.path = '';
  var session = $cookies.session;
  $scope.msg = "Enter path to hit Phekb and show a response";
  $scope.data = "Response data  will be shown here";
  //$scope.errors = ();

  $scope.paths = ['user/'+user.uid];

  $scope.getPhekb = function getPhekb()
  {

    if ($scope.user && $scope.path)
    {
      //console.log("Hitting phekb");
      var request = $http.post('/api/user/resources', { session: $scope.user.session, path: $scope.path, uid: $scope.user.uid});
      request.then(function(response) {
        $scope.msg = "Hello this was from the then";
        //console.log($scope.msg);
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
  //$scope.errors = ();
  var session = $cookies.session;
  $scope.msg = "PheKB.org logging in ...";

  var args = $location.search();
  $scope.data = '';//"Args: sess_id : " + args.sess_id + " uid : " + args.uid + " nid: " + args.nid + " id : " + args.id ;

  // Go to edit if they have access or access denied
  function phekb_goto_edit(access) {
    // Stop access right here to prevent people from coming from phekb with random node
    // ids and creating phema items for them
    var user = security.currentUser;
    if (access.can_edit) {
      //  phekb sends 0 for phenotypes that haven't been authored yet or the hex id
      if (args.id.length > 1) {

        $location.path('/phenotype/'+args.id).search({}).replace();
      }
      else {
        console.log(user);
        var external = { nid: args.nid, site: args.site, url: phekbUrl + "/phenotype/" + args.nid };
        var phenotype = {user: user, modifiedBy: user.email, createdBy: user.email, name: args.title, description: args.description,
        external: external };  //nid: args.nid, uid: args.uid, site: args.site };
        LibraryService.saveDetails(phenotype)
          .then(function(data) {
            $location.path('/phenotype/' + data.id).search({}).replace();
          }, function() {
            $scope.errorMessage = 'There was an error trying to save your phenotype definition and launch the authoring tool';
          });
      }
    }
    else {
      $location.path('/access-denied');
    }
  }

  function phekb_server_error(error) {
    $scope.msg = "A error occurred communicating with PheKB. Please try again or contact us.";
    console.log("error phekb.js access ", error);
  }

  // If user logged in at phekb is not user logged in here or we have a new session , logout this user to be safe and try to login phekb user
  if ( (args.sess_id && args.uid) || (user && args.uid && user.uid != args.uid) ) {
    console.log("Logging out ", user);
    security.logout();
  }

  var library_id = args.nid;
  if (!library_id) {
    $location.path('/access-denied');
  }

  // Log user in if we have sid and uid
  if (args.sess_id && args.uid ) {
    // Try to login with uid and sess string  . A custom Phekb service allows this
    security.login(args.uid, args.sess_id, function(error, success) {
      if (error || !success) {
        $scope.msg = 'PheKB login failed. Please try again or contact us.';
        console.log('phekb entry login failed ', error);
        $scope.user = null;
        $scope.session = null;
        return;
      }

      $scope.user = security.currentUser;
      if ($scope.user ) {
        $scope.msg = "Welcome, " + $scope.user.fullName;
        //console.log($scope.user);
        // Entry to Edit a phenotype
        if (args.action == 'edit' ){
          security.phenotypeAccess(library_id).then(phekb_goto_edit, phekb_server_error);
        } // End edit phenotype entry
      }
      else {
        $scope.msg = "Something unknown went wrong logging in: " + user;
      }
    });
  }
  else if (user) {
    // Here same user is already logged in
    if (args.action == 'edit' ){
      security.phenotypeAccess(library_id).then(phekb_goto_edit, phekb_server_error);
    }
  }
}]);
