'use strict';

angular.module('sophe.services.attribute', ['sophe.services.url', 'ngResource'])
.service('AttributeService', ['URLService', '$resource', '$q', function(URLService, $resource, $q) {
  this._load = function(url, parameters) {
    var deferred = $q.defer();
    $resource(url).get(parameters, function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.loadAll = function(type) {
    if (type === 'fhir' || type === 'FHIR') {
      return this._load(URLService.getFHIRServiceURL('attributes'));
    }
    else {
      return this._load(URLService.getDataServiceURL('attributes'));
    }
  };

  this.loadCategory = function(id, type) {
    if (type === 'fhir' || type === 'FHIR') {
      return this._load(URLService.getFHIRServiceURL('category/:category/attributes'), {category: id});
    }
    else {
      return this._load(URLService.getDataServiceURL('category/:category/attributes'), {category: id});
    }
  };

  this.loadElement = function(id, type) {
    if (type === 'fhir' || type === 'FHIR') {
      return this._load(URLService.getFHIRServiceURL('datatype/:dataElement/attributes'), {dataElement: id});
    }
    else {
      return this._load(URLService.getDataServiceURL('dataElement/:dataElement/attributes'), {dataElement: id});
    }
  };

  // Test an attribute name against a list of filtered attributes.  There are some attributes that come back
  // in the FHIR specification, for example, that are not relevant to what we are interested in.
  function isFiltered(name) {
    var re = /\.((meta)|(uid)|(id)|(description)|(text)|(modifierExtension)|(identifier)|(url)|(extension)|(implicitRules))/;
    return re.test( name ); // returns true or false;
  }

  this.processValues = function(data) {
    var attributes = [];
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (var index = 0; index < originalData.length; index++) {
        if (!isFiltered(originalData[index].dataElementName.value)) {
          transformedData.push({
            id: originalData[index].dataElementName.value,
            name: originalData[index].attributeLabel.value,
            uri: originalData[index].id.value,
            type: originalData[index].attributeLabel.datatype } );
        }
      }
      attributes = transformedData;
    }
    return attributes;
  };

  this.translateQDMToForm = function(attribute) {
    var item = {
      'type': 'text',
      'label': attribute.name,
      'model': attribute.id
    };

    if (attribute.id === 'Severity' ||
      attribute.id === 'AnatomicalLocationSite' ||
      attribute.id === 'NegationRationale' ||
      attribute.id === 'PatientPreference' ||
      attribute.id === 'ProviderPreference' ||
      attribute.id === 'RelatedTo' ||
      attribute.id === 'TargetOutcome' ||
      attribute.id === 'Laterality' ||
      attribute.id === 'Ordinality' ||
      attribute.id === 'Reaction' ||
      attribute.id === 'AnatomicalApproachSite' ||
      attribute.id === 'Reason' ||
      attribute.id === 'Method' ||
      attribute.id === 'FacilityLocation' ||
      attribute.id === 'Cause' ||
      attribute.id === 'Route' ||
      attribute.id === 'Status') {
      item.type = 'valueSet';
    }
    else if (attribute.id === 'CumulativeMedicationDuration') {
      item.type = 'number';
    }
    // We are assuming a start datetime is paired with a stop datetime
    else if (attribute.id === 'StartDatetime') {
      item.type = 'fieldset';
      item.label = 'Only include items that occur between';
      item.model = 'fieldset';
      item.fields = [
        {
          'type': 'text',
          'model': 'StartDatetime',
          'label': 'Start',
          'placeholder': 'mm/dd/yyyy'
        },
        {
          'type': 'text',
          'model': 'StopDatetime',
          'label': 'End',
          'placeholder': 'mm/dd/yyyy'
        }
      ];
    }
    else if (attribute.id === 'StopDatetime') {
      // Suppress it - we created our matched pair above
      return null;
    }
    // else if (attribute.id === 'Ordinality') {
    //   item.placeholder = '1=primary, 2=secondary';
    //   item.type = 'number';
    // }
    else if (attribute.id === 'Date' || attribute.id === 'ActiveDatetime' || attribute.id === 'AdmissionDatetime' ||
      attribute.id === 'DischargeDatetime' ||
      attribute.id === 'FacilityLocationArrivalDatetime' ||
      attribute.id === 'FacilityLocationDepartureDatetime' ||
      attribute.id === 'IncisionDatetime') {
      item.type = 'date';
    }
    else if (attribute.id === 'Result') {
      item.type = 'result';
    }
    else if (attribute.type === 'http://www.w3.org/2001/XMLSchema#date') {
      item.type = 'date';
    }
    else if (attribute.type === 'http://www.w3.org/2001/XMLSchema#dateTime') {
      item.type = 'datetime';
    }

    return item;
  };
}]);