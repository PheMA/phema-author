'use strict';

describe('Array Util', function () {

  beforeEach(function() {
    this.array = [
    { name: 'A', value: '1', children:
      [
        { name: 'B', value: '1.5' }
      ]
    },
    { name: 'C', value: '2', children: [] },
    { name: 'D', value: '3', children:
      [
        { name: 'E', value: '3.5' }
      ]
    },
    ];
  });

  describe('findInArray', function() {
    it('finds an item', inject(function() {
      expect(ArrayUtil.findInArray(this.array, 'name', 'C').value).toEqual('2');
    }));

    it('returns null for an unknown item', inject(function() {
      expect(ArrayUtil.findInArray(this.array, 'name', 'Z')).toEqual(null);
    }));

    it('does not search below the array elements', inject(function() {
      expect(ArrayUtil.findInArray(this.array, 'name', 'B')).toEqual(null);
    }));
  });

  describe('findInArrayOrChildren', function() {
    it('finds a parent item', inject(function() {
      expect(ArrayUtil.findInArrayOrChildren(this.array, 'name', 'C').value).toEqual('2');
    }));

    it('finds a child item', inject(function() {
      expect(ArrayUtil.findInArrayOrChildren(this.array, 'name', 'B').value).toEqual('1.5');
    }));
  });
});