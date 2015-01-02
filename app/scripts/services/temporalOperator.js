'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.temporalOperator', ['sophe.services.url', 'ngResource'])
.service('TemporalOperatorService', ['$resource', '$q', 'URLService', function($resource, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getDataServiceURL('temporalOperators')).get(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var temporalOperators = [];
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push({
          id: originalData[index].dataElementName.value,
          name: originalData[index].temporalOperatorLabel.value,
          uri: originalData[index].id.value,
          type: 'TemporalOperator',
          children: []} );
      }
      temporalOperators = transformedData.sort(ArrayUtil.sortByName);
    }
    return temporalOperators;
  };

  this.buildRelationshipListFromPrefix = function (prefix, relationship, temporalOperators) {
    var regexp = new RegExp('^' + prefix, 'i');
    for (var index = 0; index < temporalOperators.length; index++) {
      var item = temporalOperators[index];
      if (item.name.search(regexp) === 0) {
        var lowerName = item.name.toLowerCase();
        relationship.modifiers.push({id: item.uri, label: lowerName.replace(regexp, '').trim()});
      }
    }
  };

  this.buildRelationshipListForProperties = function(temporalOperators) {
    var relationships = [
      {
        id: 'starts',
        label: 'starts',
        modifiers: [],
        allowsTimeRange: true
      },
      {
        id: 'ends',
        label: 'ends',
        modifiers: [],
        allowsTimeRange: true
      },
      {
        id: 'concurrent with',
        label: 'is concurrent with',
        modifiers: [],
        allowsTimeRange: false,
        uri: ArrayUtil.findInArray(temporalOperators, 'name', 'Concurrent With').uri
      },
      {
        id: 'during',
        label: 'occurs during',
        modifiers: [],
        allowsTimeRange: false,
        uri: ArrayUtil.findInArray(temporalOperators, 'name', 'During').uri
      },
      {
        id: 'overlaps',
        label: 'overlaps with',
        modifiers: [],
        allowsTimeRange: false,
        uri: ArrayUtil.findInArray(temporalOperators, 'name', 'Overlaps').uri
      }
    ];

    this.buildRelationshipListFromPrefix('starts', relationships[0], temporalOperators);
    this.buildRelationshipListFromPrefix('ends', relationships[1], temporalOperators);

    return relationships;
  };

  this.convertQDMToSoPhe = function(uri, temporalOperators) {
    var item = ArrayUtil.findInArray(temporalOperators, 'uri', uri);
    if (item === null) {
      return null;
    }

    // We have a pre-defined list of prefixes we look for
    var temporalOperator = item.name;
    var regexp = new RegExp('^(starts|ends|concurrent with|during)\\s?(.*)', 'i');
    var match = regexp.exec(temporalOperator);
    var result = null;
    if (match !== null) {
      result = { base: match[1].toLowerCase(), modifier: match[2].toLowerCase() };
    }
    return result;
  };
}]);