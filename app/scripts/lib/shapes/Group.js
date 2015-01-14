(function() {
    Kinetic.PhemaGroup = function(config) {
        this._initElement(config);
    };

    Kinetic.PhemaGroup.prototype = {
        _initElement: function(config) {
            //this.nodeType = 'Group';
            this.className = 'PhemaGroup';
            // call super constructor
            Kinetic.Group.call(this, config);
        }
    };
    Kinetic.Util.extend(Kinetic.PhemaGroup, Kinetic.Group);

    // add getters setters

    Kinetic.Factory.addGetterSetter(Kinetic.PhemaGroup, 'element', null);

    /**
     * get/set clockwise flag
     * @name clockwise
     * @method
     * @memberof Kinetic.PhemaElement.prototype
     * @param {Boolean} clockwise
     * @returns {Boolean}
     * @example
     * // get clockwise flag<br>
     * var clockwise = arc.clockwise();<br><br>
     *
     * // draw arc counter-clockwise<br>
     * arc.clockwise(false);<br><br>
     *
     * // draw arc clockwise<br>
     * arc.clockwise(true);
     */

    //Kinetic.Collection.mapMethods(Kinetic.PhemaElement);
})();
