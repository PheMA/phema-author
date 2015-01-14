(function() {
    Kinetic.PhemaConnector = function(config) {
        this._initElement(config);
    };

    Kinetic.PhemaConnector.prototype = {
        _initElement: function(config) {
            // call super constructor
            Kinetic.Circle.call(this, config);
            this.className = 'PhemaConnector';
        }
    };
    Kinetic.Util.extend(Kinetic.PhemaConnector, Kinetic.Circle);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnector, 'originalStrokeWidth', 1);

    Kinetic.Factory.addGetterSetter(Kinetic.PhemaConnector, 'connections', []);
})();
