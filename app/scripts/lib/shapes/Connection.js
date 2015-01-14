(function() {
    Kinetic.PhemaConnection = function(config) {
        this._initElement(config);
    };

    Kinetic.PhemaConnection.prototype = {
        _initElement: function(config) {
            this.className = 'PhemaConnection';
            // call super constructor
            Kinetic.Line.call(this, config);
        }
    };
    Kinetic.Util.extend(Kinetic.PhemaConnection, Kinetic.Line);

    // add getters setters
})();
