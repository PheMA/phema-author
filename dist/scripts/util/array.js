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
  },

  findInArrayOrChildren: function(array, key, value) {
    var item = ArrayUtil.findInArray(array, key, value);
    if (item === null) {
      var children = null;
      for (var index = 0; index < array.length; index++) {
        children = array[index].children;
        if (children && children.length > 0) {
          item = ArrayUtil.findInArray(array[index].children, key, value);
          if (item !== null) {
            break;
          }
        }
      }
    }

    return item;
  },

  sortByName: function(obj1, obj2) {
    if (obj1 === null || obj1 === undefined || obj1.name === null || obj1.name === undefined) {
      if (obj2 === null || obj2 === undefined || obj2.name === null || obj2.name === undefined) {
        return 0;
      }
      return 1;
    }

    return obj1.name.localeCompare(obj2.name);
  }
};