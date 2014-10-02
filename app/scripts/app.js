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
    //'ngResource',
    'ngRoute',
    //'ngSanitize',
    //'ngTouch',
    //'canvasModule',
    'ui.bootstrap',
    'sophe-kinetic',
    'sophe-menu',
    'security'
  ]);

app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        title: 'Home', templateUrl: 'views/main.html', controller: 'MainCtrl' })
      .when('/dashboard', {
        title: 'Dashboard', templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl' })
      .when('/about', {
        title: 'About', templateUrl: 'views/about.html', controller: 'AboutCtrl' })
      .when('/phenotype', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeCtrl' })
      .when('/phenotype/new', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeCtrl' })
      .when('/phenotype/:id', {
        title: 'Phenotypes', templateUrl: 'views/phenotypes/edit.html', controller: 'PhenotypeCtrl' })
      .otherwise({
        redirectTo: '/'
      });
  });

/*app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current) {
        $rootScope.title = current.$$route.title;
    });
}]);*/