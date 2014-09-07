/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * crazyflie may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('crazyflie.CopterService')

//@Require('Class')
//@Require('Obj')
//@Require('bugioc.ArgTag')
//@Require('bugioc.IInitializingModule')
//@Require('bugioc.ModuleTag')
//@Require('bugmeta.BugMeta')
//@Require('crazyflie.CopterManager')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Obj                     = bugpack.require('Obj');
    var ArgTag                  = bugpack.require('bugioc.ArgTag');
    var IInitializingModule     = bugpack.require('bugioc.IInitializingModule');
    var ModuleTag               = bugpack.require('bugioc.ModuleTag');
    var BugMeta                 = bugpack.require('bugmeta.BugMeta');
    var CopterManager           = bugpack.require('crazyflie.CopterManager');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var arg                     = ArgTag.arg;
    var bugmeta                 = BugMeta.context();
    var module                  = ModuleTag.module;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------


    /**
     * @class
     * @extends {Obj}
     * @implements {IInitializingModule}
     */
    var CopterService = Class.extend(Obj, {

        _name: "crazyflie.CopterService",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {CopterManager} copterManager
         */
        _constructor: function(copterManager) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {CopterManager}
             */
            this.copterManager      = copterManager;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {CopterManager}
         */
        getCopterManager: function() {
            return this.copterManager;
        },


        //-------------------------------------------------------------------------------
        // IInitializingModule Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        deinitializeModule: function(callback) {
            this.copterManager.removeEventListener(CopterManager.EventTypes.COPTER_DETECTED, this.hearCopterDetected, this);
            this.copterManager.removeEventListener(CopterManager.EventTypes.COPTER_LOST, this.hearCopterLost, this);
            this.copterManager.stopScanningForCopters();
            callback();
        },

        /**
         * @param {function(Throwable=)} callback
         */
        initializeModule: function(callback) {
            this.copterManager.addEventListener(CopterManager.EventTypes.COPTER_DETECTED, this.hearCopterDetected, this);
            this.copterManager.addEventListener(CopterManager.EventTypes.COPTER_LOST, this.hearCopterLost, this);
            this.copterManager.startScanningForCopters();
            callback()
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Copter} copter
         */
        processCopterDetected: function(copter) {
            copter.connectToCopter();
        },

        /**
         * @private
         * @param {Copter} copter
         */
        processCopterLost: function(copter) {

        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearCopterDetected: function(event) {
            this.processCopterDetected(event.getData().copter);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearCopterLost: function(event) {
            this.processCopterLost(event.getData().copter);
        }
    });


    //-------------------------------------------------------------------------------
    // Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(CopterService, IInitializingModule);


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(CopterService).with(
        module("copterService")
            .args([
                arg().ref("copterManager")
            ])
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('crazyflie.CopterService', CopterService);
});
