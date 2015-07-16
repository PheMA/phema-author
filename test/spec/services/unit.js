'use strict';

describe('Factory: UnitService', function () {

  beforeEach(module('sophe.services.unit'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_UnitService_, _$http_, _$httpBackend_) {
    this.UnitService = _UnitService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.unitsGet = this.$httpBackend.when('GET', 'data/units.json');
    this.unitsGet.respond([]);
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.UnitService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('returns a sorted and formatted list', inject(function() {
      this.unitsGet.respond([
        {code:"nm/{m}", value:"nm per meter"},
        {code:"[arb'U]", value:"arbitrary unit"},
      ]);
      var units = [];
      this.UnitService.load()
        .then(this.UnitService.processValues)
        .then(function(u) { units = u; });
      this.$httpBackend.flush();
      expect(units.length).toEqual(2);
      expect(units[0].name).toEqual('arbitrary unit');
      expect(units[0].id).toEqual('[arb\'U]');
      expect(units[0].label).toEqual('arb\'U');
      expect(units[1].name).toEqual('nm per meter');
      expect(units[1].id).toEqual('nm/{m}');
      expect(units[1].label).toEqual('nm/ m');
    }));
  });
});