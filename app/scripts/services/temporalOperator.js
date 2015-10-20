'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.temporalOperator', ['sophe.services.url', 'ngResource'])
.filter('advancedFilter', function() {
  return function(items, showAdvanced) {
    if (items) {
      var advancedRegEx = new RegExp('Or Concurrent With', 'i');
      var list = items.filter(function(element) {
        return (showAdvanced || element.label.search(advancedRegEx) === -1);
      });
      return list;
    }
  };
})
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
    // We are going to build a hierarchy of operators specific
    // to our application.  Some of these values are represented in
    // QDM, while others are our own constructs.
    var temporalOperators = [
      {
        id: 'Before',
        linkRegex: new RegExp('^[a-z]+\\sbefore', 'i'),
        name: 'Before',
        uri: 'http://projectphema.org/TemporalOperator#Before',
        type: 'TemporalOperator',
        children: []
      },
      {
        id: 'After',
        linkRegex: new RegExp('^[a-z]+\\safter', 'i'),
        name: 'After',
        uri: 'http://projectphema.org/TemporalOperator#After',
        type: 'TemporalOperator',
        children: []
      },
      {
        id: 'During',
        uri: 'http://rdf.healthit.gov/qdm/element#During'
      },
      {
        id: 'ConcurrentWith',
        uri: 'http://rdf.healthit.gov/qdm/element#ConcurrentWith'
      },
      {
        id: 'Overlaps',
        uri: 'http://rdf.healthit.gov/qdm/element#Overlaps'
      }
    ];

    if (data && data.results) {
      var originalData = data.results.bindings;
      var index;
      for (index = 0; index < originalData.length; index++) {
        var item = {
          id: originalData[index].dataElementName.value,
          name: originalData[index].temporalOperatorLabel.value,
          uri: originalData[index].id.value,
          type: 'TemporalOperator',
          description: originalData[index].definition.value,
          tooltip: originalData[index].definition.value + '<div class="popup-diagram"><img src="images/temporal/' + originalData[index].dataElementName.value + '.png" /></div>',
          children: []
        };

        var existingItem = ArrayUtil.findInArray(temporalOperators, 'uri', originalData[index].id.value);
        if (existingItem) {
          existingItem.id = item.id;
          existingItem.name = item.name;
          existingItem.type = item.type;
          existingItem.description = item.description;
          existingItem.tooltip = item.tooltip;
          existingItem.children = item.children;
        }
        else {
          for (var categoryIndex = 0; categoryIndex < temporalOperators.length; categoryIndex++) {
            if (temporalOperators[categoryIndex].linkRegex &&
              (item.name.search(temporalOperators[categoryIndex].linkRegex) === 0)) {
              temporalOperators[categoryIndex].children.push(item);
            }
          }
        }
      }

      for (index = 0; index < temporalOperators.length; index++) {
        if (temporalOperators[index].children) {
          temporalOperators[index].children = temporalOperators[index].children.sort(ArrayUtil.sortByName);
        }
      }

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

      // Also check the children items, as they may contain appropriate modifiers
      this.buildRelationshipListFromPrefix(prefix, relationship, temporalOperators[index].children);
    }
  };

  this.buildRelationshipListForProperties = function(temporalOperators) {
    var relationships = [
      {
        id: 'after',
        label: 'occurs after',
        modifiers: [],
        allowsTimeRange: false,
        uri: ArrayUtil.findInArray(temporalOperators, 'name', 'After').uri
      },
      {
        id: 'before',
        label: 'occurs before',
        modifiers: [],
        allowsTimeRange: false,
        uri: ArrayUtil.findInArray(temporalOperators, 'name', 'Before').uri
      },
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

    this.buildRelationshipListFromPrefix('starts', relationships[2], temporalOperators);
    this.buildRelationshipListFromPrefix('ends', relationships[3], temporalOperators);

    return relationships;
  };

  this.convertQDMToSoPhe = function(uri, temporalOperators) {
    var item = ArrayUtil.findInArrayOrChildren(temporalOperators, 'uri', uri);
    if (item === null) {
      return null;
    }

    // We have a pre-defined list of prefixes we look for
    var temporalOperator = item.name;
    var regexp = new RegExp('^(starts|ends|concurrent with|during|before|after)\\s?(.*)', 'i');
    var match = regexp.exec(temporalOperator);
    var result = null;
    if (match !== null) {
      result = { base: match[1].toLowerCase(), modifier: match[2].toLowerCase() };
    }
    return result;
  };
}]);