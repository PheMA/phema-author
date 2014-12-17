'use strict';

var ArrayUtil = ArrayUtil || {};
ArrayUtil = {
  findInArray: function(array, key, value) {
    for (var index = 0; index < array.length; index++) {
        if (array[index][key] === value) {
            return array[index];
        }
    }
    return null;
  }
};