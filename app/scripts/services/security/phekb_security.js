// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
// phekb_security.js 
// Security Authorization for phekb integration 
// These are our local security services that call out the the webservices on the server 
angular.module('security.service', [
  'ngCookies',              // cookies api
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'security.register',      // Registration form controller
  'ui.bootstrap.modal'      // Used to display the login form as a modal dialog.
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$modal', '$rootScope', '$cookies', '$window',
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
        console.log(service.currentUser);
        $rootScope.$broadcast('user:updated', service.currentUser);
        closeLoginDialog(true);
        return service.currentUser;
        }
        
      });
    },
    
    // See if user has access to phekb data they are trying to view 
    // data looks like : {action: edit, type: phenotype , obj: phenotype_obj }
    // returns {access: "granted"||"denied" reason: "Reason for granting access " , error:null or "error string"}
    phekb_access: function(data) {
      var request = $http.post('/api/phekb/access', data);

      return request.then(function(response) {
          return response.data; 
          }, function (error) {
            return {error: error};
          }
        ); 
        
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
      else {
        window.location('https://phekb.org');
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