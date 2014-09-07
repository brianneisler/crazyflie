/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * evolution-drone may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('crazyflie.Crazyflie')

//@Require('Class')
//@Require('Obj')
//@Require('Proxy')
//@Require('crazyflie.Copter')
//@Require('crazyflie.CopterManager')
//@Require('crazyflie.CopterService')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Obj             = bugpack.require('Obj');
    var Proxy           = bugpack.require('Proxy');
    var Copter          = bugpack.require('crazyflie.Copter');
    var CopterManager   = bugpack.require('crazyflie.CopterManager');
    var CopterService   = bugpack.require('crazyflie.CopterService');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var Crazyflie = Class.extend(Obj, {

        _name: "crazyflie.Crazyflie",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Public Properties
            //-------------------------------------------------------------------------------

            /**
             * @type {function(new:Copter)}
             */
            this.Copter             = Copter;

            /**
             * @type {function(new:CopterManager)}
             */
            this.CopterManager      = CopterManager;

            /**
             * @type {function(new:CopterService)}
             */
            this.CopterService      = CopterService;
        }
    });


    //-------------------------------------------------------------------------------
    // Private Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {Crazyflie}
     */
    Crazyflie.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {Crazyflie}
     */
    Crazyflie.getInstance = function() {
        if (Crazyflie.instance === null) {
            Crazyflie.instance = new Crazyflie();
        }
        return Crazyflie.instance;
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('crazyflie.Crazyflie', Crazyflie);
});
