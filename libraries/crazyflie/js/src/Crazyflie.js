/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * crazyflie may be freely distributed under the MIT license.
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
//@Require('crazyflie.Radio')
//@Require('crazyflie.RadioManager')


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
    var Radio           = bugpack.require('crazyflie.Radio');
    var RadioManager    = bugpack.require('crazyflie.RadioManager');


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

            /**
             * @type {function(new:Radio)}
             */
            this.Radio              = Radio;

            /**
             * @type {function(new:RadioManager)}
             */
            this.RadioManager       = RadioManager;
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
