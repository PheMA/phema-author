angular.module('security.service', [])
.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
    return $http
      .post('/login', credentials)
      .then(function (res) {
        Session.create(res.data.token, res.data.user);
        return res.data.user;
      });
  };
 
  authService.isAuthenticated = function () {
    return !!Session.user && !!Session.token;
  };

  authService.currentUser = function() {
    if (this.isAuthenticated()) {
      return Session.user;
    }
    return null;
  }
 
  return authService;
})

.service('Session', function () {
  this.create = function (token, user) {
    this.token = token;
    this.user = user;
  };
  this.destroy = function () {
    this.token = null;
    this.user = null;
  };
})