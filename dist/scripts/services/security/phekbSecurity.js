// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
// phekb_security.js 
// Security Authorization for phekb integration 
// These are our local security services that call out the the webservices on the server 
angular.module('security.service.phekb', [
  'ngCookies',              // cookies api
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'security.register.phekb',      // Registration form controller
  'ui.bootstrap.modal'      // Used to display the login form as a modal dialog.
])

.factory('phekbSecurity', ['$http', '$q', '$location', 'securityRetryQueue', '$modal', '$rootScope', '$cookies', '$window',
  function($http, $q, $location, queue, $modal, $rootScope, $cookies, $window) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  var loginDialog = null;
  function openLoginDialog() {
    if ( !loginDialog ) {
      //loginDialog = $modal.open();
      loginDialog = $modal.open({
        templateUrl: 'views/security/login.html',
        controller: 'LoginFormController'})
      loginDialog.result.then(onLoginDialogClose);
    }
  }
  function closeLoginDialog(success) {
    if (loginDialog) {
      loginDialog.close(success);
      loginDialog = null;
    }
  }

  function onLoginDialogClose(success) {
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
      redirect();
    }
  }

  // Registration dialog stuff
  var registerDialog = null;
  function openRegisterDialog() {
    if ( !registerDialog ) {
      //loginDialog = $modal.open();
      registerDialog = $modal.open({
        templateUrl: 'views/security/register.html',
        controller: 'RegisterController'
      });
      registerDialog.result.then(onRegisterDialogClose);
    }
  }
  
  function closeRegisterDialog(success) {
    if (registerDialog) {
      registerDialog.close(success);
      registerDialog = null;
    }
  }

  function onRegisterDialogClose(success) {
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
      redirect();
    }
  }
  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem) {
    if ( queue.hasMore() ) {
      service.showLogin();
    }
  });

  // The public API of the service
  var service = {
    // Disable login on phat here . They will have to login through other means like phekb
    loginDisabled: true,

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function() {
      openLoginDialog();
    },
    showRegister: function() {
      // Phekb register there 
      // TODO 
      var url = 'https://phekb.org/contact';
      $window.open(url, '_blank');
      /* openRegisterDialog(); */
    },
    closeRegister: function(success) {
      closeRegisterDialog(success);
    },

    // Attempt to authenticate a user by the given email and password
    login: function(email, password) {
      var request = $http.post('/api/login', {email: email, password: password});

      return request.then(function(response) {
        if (!response.data.user) {
          service.currentUser = null;
          console.log(response);
          return null; 
        }
        else {
        service.currentUser = response.data.user;
        $cookies.session = service.currentUser.session;
        //console.log(service.currentUser);
        $rootScope.$broadcast('user:updated', service.currentUser);
        closeLoginDialog(true);
        return service.currentUser;
        }
        
      });
    },
    
    // return access user has  to phenotype they want to edit or view 
    // example return: {can_edit: true or false , access_type : admin || owner || public }
    phenotype_access: function(library_id) {
      var deferred = $q.defer();
      if (!service.currentUser) { 
        deferred.reject("You must be logged in.");
      }
      else {
        var user = service.currentUser;
        var session = user.session;
        if (session) {
          var url = '/api/phenotype-access';
          var props = $http.post(url,{user:user, library_id: library_id}); 
          props.then( function(response) {
            //console.log("library service phenotype access data: ", response.data);
            deferred.resolve(response.data);
          }, function(response) {
            deferred.reject('There was an error getting phenotype access: ' + response);
          });
        }
        else {
          deferred.reject('You must be logged in.');
        }
      }
      return deferred.promise;

    },
      

    // Give up trying to login and clear the retry queue
    cancelLogin: function() {
      closeLoginDialog(false);
      redirect();
    },
    // Give up trying to login and clear the retry queue
    closeLogin: function(success) {
      closeLoginDialog(success);
      
    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      $cookies.session = null;
      service.currentUser = null;
      $rootScope.$broadcast('user:updated', service.currentUser);
      if (redirectTo) {
        redirect(redirectTo);
      }
      
      /*$http.post('/api/logout').then(function() {
        service.currentUser = null;
        redirect(redirectTo);
      }); */
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } 
      else {
        session = $cookies.session;
        if (session) {
          return $http.post('/api/current-user', {session: session}).then(function(response) {
            service.currentUser = response.data.user;
            $rootScope.$broadcast('user:updated', service.currentUser);
            return service.currentUser;
          },  
          function(error) { 
            console.log(error);
            return null;
          }); 
        }
        else {
          return null;
        }
      }
    },

    // Information about the current user, set this from any controller like login or register
    // Get user from session cookie
    currentUser: null,
      

    // Is the current user authenticated?
    isAuthenticated: function(){
      if (service.currentUser == null) {
        //service.currentUser = {firstName: "Phekb", lastName: "User"};
      }
      return !!service.currentUser;
    },

    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  // Initialize current user from session cookie
  service.requestCurrentUser();

  return service;
}]);