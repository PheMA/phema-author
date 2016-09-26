// This provides a stub to be used just for development environments, where it will blindly assing a user.
angular.module('security.service.stub', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'ui.bootstrap.modal'     // Used to display the login form as a modal dialog.
])

.factory('stubSecurity', ['$http', '$q', '$location', 'securityRetryQueue', '$modal', function($http, $q, $location, queue, $modal) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  var loginDialog = null;
  function openLoginDialog() {
    if ( !loginDialog ) {
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
      service.login();
    },

    // Attempt to authenticate a user by the given email and password
    login: function(email, password, callback) {
      if (service.currentUser == null) {
        service.currentUser = {firstName: "Test", lastName: "Person"};
        service.token = "stuby-token";
        if (callback) { callback(null, true); }
      }
    },

    // Give up trying to login and clear the retry queue
    cancelLogin: function() {
      closeLoginDialog(false);
      redirect();
    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      service.currentUser = null;
      service.token = null;
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      return service.currentUser;
    },

    // Information about the current user
    currentUser: null,

    // Token for the current user
    token: null,

    // Is the current user authenticated?
    isAuthenticated: function(){
      return (service.currentUser !== null);
    },

    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);