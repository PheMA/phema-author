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
    //'ngAnimate',
    //'ngCookies',
    'ngResource',
    'ngRoute',
    //'ngSanitize',
    //'ngTouch',
    'treeControl',
    'ui.bootstrap',
    'sophe',
    'security',
    'ng-context-menu',
    'dynform',
    'angularSpinner',
    'toolbar',
    'phekb'
  ]);

app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        title: 'Home', templateUrl: 'views/main.html', controller: 'MainController' })
      .when('/dashboard', {
        title: 'Dashboard', templateUrl: 'views/dashboard.html', controller: 'DashboardController' })
      .when('/about', {
        title: 'About', templateUrl: 'views/about.html', controller: 'AboutController' })

      .when('/phenotype', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
      .when('/phenotype/new', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
      .when('/phenotype/search', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
      .when('/phenotype/:id', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
       
      .when('/help/quick-start', {
        title: 'Help - Quick Start', templateUrl: 'views/help/quickStart.html', controller: 'HelpController' })
      .when('/help/tutorial', {
        title: 'Help - Tutorial', templateUrl: 'views/help/tutorial.html', controller: 'HelpController' })
      .when('/help', {
        title: 'Help', templateUrl: 'views/help/index.html', controller: 'HelpController' })

      //.when('/phekb-resource', {
      //  title: 'Phekb Resource', templateUrl: 'views/phekb_resource.html', controller: 'PhekbController' })
      .when('/phekb', {
        title: 'PheKB Entry Point', templateUrl: 'views/phekb_entry.html', controller: 'PhekbEntryController' })
      .when('/access-denied', {
        title: 'Access Denied', templateUrl: 'views/access-denied.html', controller: 'MainController' })

      .otherwise({
        redirectTo: '/'
      })
      ;
  });

/*app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current) {
        $rootScope.title = current.$$route.title;
    });
}]);*/

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