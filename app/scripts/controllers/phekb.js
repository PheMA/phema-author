'use strict';

var mod = angular.module('phekb', ['ngCookies']);
var phekb_url = "http://local.phekb.org";
//var phekb_url = "https://phekb.org";
function htmlToPlaintext(text) {
  return text ? String(text).replace(/<[^>]+>/gm, '') : '';
}

/* Utility function to take phenotype from phekb and add it to the local library where it can be edited . 
 * The local library will link the id to a node on phekb.org. This way all phekb.org needs to know is the id. 
 */

function phekb_add_to_local_lib(user, phenotype, $scope, LibraryService, i, ptype){
  var external = { nid: phenotype.nid, site: phekb_url, url: phekb_url + "/phenotype/" + phenotype.nid };
  var lib_pheno = {phekb: true, modifiedBy: user.email, createdBy: user.email, name: phenotype.title, description: phenotype.description,
  external: external, user : user};  
  LibraryService.saveDetails(lib_pheno)
    .then(function(data) {
      console.log("added phekb pheno to local lib : " + data.id);
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

mod.controller('PhekbController', ['$scope', 'security', '$http', '$rootScope', '$cookies',function($scope, security, $http, $rootScope, $cookies) {
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
    console.log("submitted getPhekb");
    if ($scope.user && $scope.path)
    {
      //console.log("Hitting phekb");
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
  //$scope.errors = ();
  var session = $cookies.session; 
  $scope.msg = "Phekb Entry . Attempting Login.";
  
  var args = $location.search();
  $scope.data = "Args: sess_id : " + args.sess_id + " uid : " + args.uid + " nid: " + args.nid + " id : " + args.id ; 
  
  // If user logged in at phekb is not user logged in here, logout this user to be safe and try to login phekb user
  if (user && args.uid && user.uid != args.uid) { 
      security.logout(); 
  }

  if (user)
  {
    
    // Here same user is logged in 
    if (args.action == 'edit' ){
      
      //  phekb sends 0 for phenotypes that haven't been authored yet or the hex id 
      if (args.id.length > 1) {
        $location.path('/phenotype/'+args.id).search({}).replace();
      }
      else {
        var external = { nid: args.nid, site: args.site, url: phekb_url + "/phenotype/" + args.nid };
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

  }

  // Log user in if we have sid and uid 
  else if (args.sess_id && args.uid ) {
    // Try to login with uid and sess string  . A custom Phekb service allows this 
    security.login(args.uid, args.sess_id).then(function(user) {
      $scope.user = security.currentUser;
      //console.log($scope.user);
      // Entry to Edit a phenotype 
      if (args.action == 'edit' ){
        var library_id = args.nid;
        LibraryService.phenotype_access(library_id).then(function(access) {
          console.log("phekb.js access: ", access);
          if (access.can_edit) {
            if (args.id.length > 1) {  // 0 by default on phekb 
              $location.path('/phenotype/'+args.id).search({}).replace();
            }
            else {
              var external = { nid: args.nid, uid: args.uid, site: args.site, url: phekb_url + "/phenotype/" + args.nid };
              // Luke: external object in phekb is not getting passed through to library for some reason . 
              var phenotype = {phekb: true, modifiedBy: user.email, createdBy: user.email, name: args.title, description: args.description,
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
            //Access denied 
            $scope.msg = "Access Denied";
          }
        }, function(error) {
          $scope.msg = "Error checking access. Try again.";
          console.log("error phekb.js access ", error);
        });
      } // End edit phenotype entry 

    }, // end login success 
    function (error) {
      $scope.msg = 'Phekb Entry Login Failed. Check the logs on phekb and here . Error: ' + error;
      console.log('phekb entry login failed ', error);
    }// end login success 
    ); 
  }
  
}]);

mod.controller('PhekbPhenotypesController', ['$scope', 'security', '$http', '$rootScope', '$cookies', 'LibraryService',function($scope, security, $http, $rootScope, $cookies, LibraryService) {
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
  var request = $http.post('/phekb-resource', { session: session, path: path, uid: $scope.user.uid});
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
  var request = $http.post('/phekb-resource', { session: session, path: path, uid: $scope.user.uid});
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



