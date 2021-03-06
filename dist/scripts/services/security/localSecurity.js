// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service.local', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'security.local',
  'ui.bootstrap.modal'     // Used to display the login form as a modal dialog.
])

.factory('localSecurity', ['$http', '$q', '$location', 'securityRetryQueue', '$uibModal', function($http, $q, $location, queue, $uibModal) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  var loginDialog = null;
  function openLoginDialog() {
    if ( !loginDialog ) {
      //loginDialog = $uibModal.open();
      loginDialog = $uibModal.open({
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
    else if (success) {
      redirect();
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

  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem) {
    if ( queue.hasMore() ) {
      service.showLogin();
    }
  });

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function() {
      openLoginDialog();
    },

    // Attempt to authenticate a user by the given email and password
    login: function(email, password, callback) {
      var request = $http.post('/login', {email: email, password: password});
      return request.then(
        function(response) {
          var data = response.data;
          service.token = data.token;
          service.currentUser = data.user;
          if ( service.isAuthenticated() ) {
            // Add some elements used for display
            service.currentUser.fullName = service.currentUser.firstName + " " + service.currentUser.lastName;
            sessionStorage.setItem("currentUser", JSON.stringify(service.currentUser));
            sessionStorage.setItem("token", service.token);
            closeLoginDialog(true);
            callback(null, true);
          }
          else {
            sessionStorage.clear();
            callback('Invalid username or password', false);
          }
        },
        function(response) {
          var data = response.data;
          callback(data.error, false);
        }
      );
    },

    // Give up trying to login and clear the retry queue
    cancelLogin: function(suppressRedirect) {
      sessionStorage.clear();
      closeLoginDialog(false);
      if (!suppressRedirect) { redirect() };
    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      $http.get('/logout').then(function() {
        service.currentUser = null;
        service.token = null;
        sessionStorage.clear();
        redirect(redirectTo);
      });
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/api/user/' + service.currentUser.id).then(function(response) {
          service.currentUser = response.data.user;
          return service.currentUser;
        });
      }
    },

    // Information about the current user
    currentUser: null,

    // Token for the current user
    token: null,

    _getOrReloadUser: function() {
      if (service.currentUser == null || service.token == null) {
        var localUser = sessionStorage.getItem("currentUser");
        var localToken = sessionStorage.getItem("token");
        if (localUser && localToken) {
          service.currentUser = JSON.parse(localUser);
          service.token = localToken;
        }
        else {
          return null;
        }
      }

      return service.currentUser;
    },

    // Is the current user authenticated?
    isAuthenticated: function(){
      return (service._getOrReloadUser() != null);
    },

    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);