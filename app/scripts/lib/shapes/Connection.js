(function() {
    Kinetic.PhemaConnection = function(config) {
        this._initElement(config);
    };

    Kinetic.PhemaConnection.prototype = {
        _initElement: function(config) {
            // call super constructor
            Kinetic.Line.call(this, config);
            this.className = 'PhemaConnection';
        }
    };
    Kinetic.Util.extend(Kinetic.PhemaConnection, Kinetic.Line);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'originalStrokeWidth', 1);

    Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'connectors', null);

    Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'label', null);

    Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnection, 'element', null);
})();
