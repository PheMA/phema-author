/* exported Conversion */

'use strict';

var Conversion = Conversion || {};

Conversion = {
  // Given a response from the Data Element Repository (DER), we convert it into a simplified
  // structure that is used within the user interface in the authoring tool.
  convertDERResponse: function(element, type) {
    return {
      id: element.dataElementName.value,
      name: element.label.value,
      description: element.definition.value,
      uri: element.id.value,
      type: type};
  }
};