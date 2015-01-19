(function() {
  Kinetic.PhemaConnection = function(config) {
    this._initElement(config);
  };

  Kinetic.PhemaConnection.prototype = {
    _initElement: function(config) {
      // call super constructor
      Kinetic.Line.call(this, config);
      this.className = 'PhemaConnection';
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
        // Special processing for the certain attributes.  Because we have circular references when we are
        // running the app, we need to convert appropriately to avoid circular references in the exported JSON.
        if (key === 'connectors') {
          obj.attrs[key] = {start: {id: val.start._id}, end: {id: val.end._id}};
          // for (var index = 0; index < val.length; index++) {
          //   obj.attrs[key].push({id: val[index]._id});
          // }
        }
        else if (key === 'label') {
          obj.attrs[key] = {id: val._id};
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
  Kinetic.Util.extend(Kinetic.PhemaConnection, Kinetic.Line);

  // add getters setters
  Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'originalStrokeWidth', 1);

  Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'connectors', null);

  Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'label', null);

  Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'element', null);
})();
