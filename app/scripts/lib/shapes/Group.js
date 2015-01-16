(function() {
  Kinetic.PhemaGroup = function(config) {
    this._initElement(config);
  };

  Kinetic.PhemaGroup.prototype = {
    _initElement: function(config) {
      this.className = 'PhemaGroup';
      // call super constructor
      Kinetic.Group.call(this, config);
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
        if (key === 'phemaObject') {
          obj.attrs[key] = val.toObject();
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

      obj.children = [];

      var children = this.getChildren();
      var len = children.length;
      for(var n = 0; n < len; n++) {
        var child = children[n];
        obj.children.push(child.toObject());
      }

      return obj;
    }
  };

  Kinetic.Util.extend(Kinetic.PhemaGroup, Kinetic.Group);

  // add getters setters

  Kinetic.Factory.addGetterSetter(Kinetic.PhemaGroup, 'element', null);

  Kinetic.Factory.addGetterSetter(Kinetic.PhemaGroup, 'phemaObject', null);

})();
