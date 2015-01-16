(function() {
  Kinetic.PhemaConnector = function(config) {
    this._initElement(config);
  };

  Kinetic.PhemaConnector.prototype = {
    _initElement: function(config) {
      // call super constructor
      Kinetic.Circle.call(this, config);
      this.className = 'PhemaConnector';
    },

    toObject: function() {
      var type = Kinetic.Util,
        obj = {},
        attrs = this.getAttrs(),
        key, val, getter, defaultValue;

      obj.attrs = {};

      // serialize only attributes that are not function, image, DOM, or objects with methods
      for(key in attrs) {
        val = attrs[key];
        // Special processing for the list of connections.  Because we have circular references when we are
        // running the app, we need to convert appropriately to avoid circular references in the exported JSON.
        if (key === 'connections') {
          obj.attrs[key] = [];
          for (var index = 0; index < val.length; index++) {
            obj.attrs[key].push({id: val[index]._id});
          }
        }
        else if (!type._isFunction(val) && !type._isElement(val) && !(type._isObject(val) && type._hasMethods(val))) {
          getter = this[key];
          // remove attr value so that we can extract the default value from the getter
          delete attrs[key];
          defaultValue = getter ? getter.call(this) : null;
          // restore attr value
          attrs[key] = val;
          if (defaultValue !== val) {
            obj.attrs[key] = val;
          }
        }
      }

      obj.id = this._id;
      obj.className = this.getClassName();
      return obj;
    }
  };
  Kinetic.Util.extend(Kinetic.PhemaConnector, Kinetic.Circle);

  // add getters setters
  Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnector, 'originalStrokeWidth', 1);

  Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnector, 'connections', []);
})();
