(function() {
    Kinetic.PhemaGroup = function(config) {
        this._initElement(config);
    };

    Kinetic.PhemaGroup.prototype = {
        _initElement: function(config) {
            this.className = 'PhemaGroup';
            // call super constructor
            Kinetic.Group.call(this, config);
        }
    };
    Kinetic.Util.extend(Kinetic.PhemaGroup, Kinetic.Group);

    // add getters setters

    Kinetic.Factory.addGetterSetter(Kinetic.PhemaGroup, 'element', null);
})();
