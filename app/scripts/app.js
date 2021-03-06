'use strict';

/**
 * @ngdoc overview
 * @name sopheAuthorApp
 * @description
 * # sopheAuthorApp
 *
 * Main module of the application.
 */
var app = angular.module('sopheAuthorApp', [
    'ngResource',
    'ngRoute',
    'treeControl',
    'ui.bootstrap',
    'sophe',
    'ng-context-menu',
    'dynform',
    'angularSpinner',
    'vcRecaptcha',
    // Select the security mode that you wish to use.  Make sure all others
    // are commented out.
    'security',
    'security.local',
    'security.phekb',
    'phekb'
  ]);

app.config(['$locationProvider', function($locationProvider) {
  // Disable the hash prefix, as it breaks our routeProvider below otherwise.
  // https://github.com/angular/angular.js/commit/aa077e81129c740041438688dff2e8d20c3d7b52
  $locationProvider.hashPrefix('');
}]);

app.config(['$routeProvider', 'dashboardController', 'dashboardView', function ($routeProvider, dashboardController, dashboardView) {
  $routeProvider
    .when('/', {
      title: 'Home', templateUrl: 'views/main.html', controller: 'MainController', isPublic: true })
    .when('/dashboard', {
      title: 'Dashboard', templateUrl: dashboardView, controller: dashboardController })
    .when('/about', {
      title: 'About', templateUrl: 'views/about.html', controller: 'AboutController', isPublic: true })

    .when('/phenotype', {
      title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
    .when('/phenotype/new', {
      title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
    .when('/phenotype/search', {
      title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
    .when('/phenotype/:id', {
      title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })

    .when('/help/quick-start', {
      title: 'Help - Quick Start', templateUrl: 'views/help/quickStart.html', controller: 'HelpController', isPublic: true })
    .when('/help/tutorial', {
      title: 'Help - Tutorial', templateUrl: 'views/help/tutorial.html', controller: 'HelpController', isPublic: true })
    .when('/help', {
      title: 'Help', templateUrl: 'views/help/index.html', controller: 'HelpController', isPublic: true })

    // Enable these lines when using standalone security
    .when('/login', {
      title: 'Log In', templateUrl: 'views/security/login.html', controller: 'LoginFormController', isPublic: true })
    .when('/users/forgotPassword', {
      title: 'Forgot Password', templateUrl: 'views/users/forgotPassword.html', controller: 'ForgotPasswordFormController', isPublic: true })
    .when('/users/resetPassword/:token', {
      title: 'Reset Password', templateUrl: 'views/users/resetPassword.html', controller: 'ResetPasswordFormController', isPublic: true })
    .when('/users/register', {
      title: 'Register for an Account', templateUrl: 'views/users/register.html', controller: 'RegisterFormController', isPublic: true })
    .when('/users/profile', {
      title: 'Manage Your Profile', templateUrl: 'views/users/profile.html', controller: 'ProfileFormController', isPublic: true })

    // Enable these lines when using PheKB
    .when('/phekb', {
      title: 'PheKB Entry Point', templateUrl: 'views/phekb/entry.html', controller: 'PhekbEntryController', isPublic: true })
    .when('/access-denied', {
      title: 'Access Denied', templateUrl: 'views/phekb/access-denied.html', controller: 'MainController', isPublic: true })

    .otherwise({
      redirectTo: '/'
    })
    ;
}]);

app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptorFactory');
}]);

app.config(['$qProvider', function ($qProvider) {
  // Disable an error being thrown when unhandled promise rejections are detected.  The long-term solution is to
  // fix these... but for now we will suppress.
  $qProvider.errorOnUnhandledRejections(false);
}]);


app.run(['$rootScope', '$location', 'security', function ($rootScope, $location, security) {
    // When the route changes, we are going to detect if the user is trying to access a public
    // page (defined within the routes above), or if the user is logged in.  If the user needs to
    // be authenticated and isn't, we take them to the login page.
    $rootScope.$on('$routeChangeStart', function (event, next) {
      if (next.$$route && !next.$$route.isPublic && !security.isAuthenticated()) {
        event.preventDefault();
        $location.path('/login');
      }
    });
}]);


//-------------------------------------------------------------------------
// The code below is a workaround to allow unsafe HTML popover controls, via http://plnkr.co/edit/4QQTNp7xrNKtkmBz4KdK?p=preview
//
angular.module('sopheAuthorApp').filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);

// update popover template for binding unsafe html
angular.module('template/popover/popover.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/popover/popover.html',
      '<div class=\'popover {{placement}}\' ng-class=\'{ in: isOpen(), fade: animation() }\'>\n' +
      '  <div class=\'arrow\'></div>\n' +
      '\n' +
      '  <div class=\'popover-inner\'>\n' +
      '      <h3 class=\'popover-title\' ng-bind-html=\'title | unsafe\' ng-show=\'title\'></h3>\n' +
      '      <div class=\'popover-content\'ng-bind-html=\'content | unsafe\'></div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
}]);
//-------------------------------------------------------------------------
