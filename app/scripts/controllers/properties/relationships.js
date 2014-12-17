'use strict';

var RelationshipPropertiesHelper = RelationshipPropertiesHelper || {};
RelationshipPropertiesHelper = {
  convertQDMToSoPhe: function(uri, temporalOperators) {
    var item = ArrayUtil.findInArray(temporalOperators, 'uri', uri);
    if (item === null) {
      return null;
    }

    // We have a pre-defined list of prefixes we look for
    var temporalOperator = item.name;
    var regexp = new RegExp('^(starts|ends|concurrent with|during)\\s?(.*)', 'i')
    var match = regexp.exec(temporalOperator);
    var result = null;
    if (match != null) {
      result = { base: match[1].toLowerCase(), modifier: match[2].toLowerCase() }
    }
    return result;
  },
  buildRelationshipListFromPrefix: function (prefix, relationship, temporalOperators) {
    var regexp = new RegExp('^' + prefix, 'i');
    for (var index = 0; index < temporalOperators.length; index++) {
      var item = temporalOperators[index];
      if (item.name.search(regexp) == 0) {
        relationship.modifiers.push({id: item.uri, label: item.name.toLowerCase().replace(regexp, '').trim()});
      }
    }
  },
  findMatchingBase: function(base, relationships) {
    return ArrayUtil.findInArray(relationships, 'id', base);
    // for (var index = 0; index < relationships.length; index++) {
    //   if (relationships[index].id === base) {
    //     return relationships[index];
    //   }
    // }

    // return null;
  },
  findMatchingModifier: function(modifier, baseItem) {
    return ArrayUtil.findInArray(baseItem.modifiers, 'label', modifier);
    // for (var index = 0; index < baseItem.modifiers.length; index++) {
    //   if (baseItem.modifiers[index].label === modifier) {
    //     return baseItem.modifiers[index];
    //   }
    // }

    // return null;
  }
};

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:RelationshipPropertiesCtrl
 * @description
 * # RelationshipPropertiesCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('RelationshipPropertiesCtrl', function ($scope, $modalInstance, element, temporalOperators) {
    $scope.element = element;
    $scope.relationship = {
      relationship: {base: '', modifier: '', value: element.uri},
      timeRange: {
        comparison: '',
        start: { value: '', units: '' },
        end: { value: '', units: '' }
      }
    };

    $scope.units = [
      { name: 'hours', value: 'h' },
      { name: 'days', value: 'd' },
      { name: 'weeks', value: 'w' },
      { name: 'months', value: 'm' },
      { name: 'years', value: 'y' }
    ];

    $scope.comparisons = [
      { name: 'at any time', showStartTime: false, showEndTime: false },
      { name: 'between', showStartTime: true, showEndTime: true },
      { name: 'exactly', showStartTime: true, showEndTime: false },
      { name: '>=', showStartTime: true, showEndTime: false },
      { name: '>', showStartTime: true, showEndTime: false },
      { name: '<=', showStartTime: true, showEndTime: false },
      { name: '<', showStartTime: true, showEndTime: false },
    ]

    $scope.relationships = [
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
        allowsTimeRange: false
      },
      {
        id: 'during',
        label: 'occurs during',
        modifiers: [],
        allowsTimeRange: false
      },
      {
        id: 'overlaps',
        label: 'overlaps with',
        modifiers: [],
        allowsTimeRange: false
      }
    ];

    RelationshipPropertiesHelper.buildRelationshipListFromPrefix('starts', $scope.relationships[0], temporalOperators);
    RelationshipPropertiesHelper.buildRelationshipListFromPrefix('ends', $scope.relationships[1], temporalOperators);

    var elementData = RelationshipPropertiesHelper.convertQDMToSoPhe(element.uri, temporalOperators);
    if (elementData != null) {
      $scope.relationship.relationship.base = RelationshipPropertiesHelper.findMatchingBase(elementData.base, $scope.relationships);
      $scope.relationship.relationship.modifier = RelationshipPropertiesHelper.findMatchingModifier(elementData.modifier, $scope.relationship.relationship.base);
      console.log($scope.relationship);
    }

    if (element.timeRange) {
      $scope.relationship.timeRange = element.relationship.timeRange;
      console.log($scope.relationship);
    }

    $scope.ok = function () {
      $modalInstance.close($scope.relationship);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
