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
    'angularSpinner'
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
      .when('/phenotype/:id', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeController' })
      // .otherwise({
      //   redirectTo: '/'
      // })
      ;
  });

/*app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current) {
        $rootScope.title = current.$$route.title;
    });
}]);*/