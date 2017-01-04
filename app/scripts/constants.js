'use strict';

/* exported Constants */

/*
  Instead of using the Angular method of defining constants, we are going to define them as a JavaScript constant object.
  This is because we have non-Angular code that needs to access the constant values, so a pure Angular solution won't work.
  We define everything in a top-level Constants object just to help better identify constants, and to reduce the number of
  global definitions we need to define in other files (for JSHint).
*/

const Constants = {
  'ElementTypes': {
    'TEMPORAL_OPERATOR': 'TemporalOperator',
    'DATA_ELEMENT': 'DataElement',
    'CATEGORY': 'Category',
    'LOGICAL_OPERATOR': 'LogicalOperator',
    'SUBSET_OPERATOR': 'SubsetOperator',
    'FUNCTION_OPERATOR': 'FunctionOperator',
    'PHENOTYPE': 'Phenotype',
    'VALUE_SET': 'ValueSet',
    'TERM': 'Term',
    'CLASSIFICATION': 'Classification'
  },
  'ExportStatuses': {
    'PROCESSING': 'processing',
    'COMPLETED': 'completed',
    'ERROR' : 'error'
  },
  'Events': {
    'SEARCH_VALUESETS': 'sophe-search-valuesets',
    'ELEMENT_SELECTED': 'sophe-element-selected',
    'CREATE_TEMPORAL_OPERATOR': 'sophe-empty-temporal-operator-created',
    'CREATE_CLASSIFICATION': 'sophe-custom-classification-created'
  }
};