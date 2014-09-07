//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('crazyflie.CopterManager')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Obj')
//@Require('bugioc.ModuleTag')
//@Require('bugmeta.BugMeta')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var aerogel             = require('aerogel');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Obj                 = bugpack.require('Obj');
    var ModuleTag           = bugpack.require('bugioc.ModuleTag');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta             = BugMeta.context();
    var module              = ModuleTag.module;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var CopterManager = Class.extend(EventDispatcher, {

        _name: "crazyflie.CopterManager",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {*}
             */
            this.aerogelDriver          = null;

            /**
             * @private
             * @type {Set.<Copter>}
             */
            this.detectedCopters        = Collections.set();

            /**
             * @private
             * @type {boolean}
             */
            this.scanning               = false;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {*}
         */
        getAerogelDriver: function() {
            return this.aerogelDriver;
        },

        /**
         * @return {Set.<Copter>}
         */
        getDetectedCopters: function() {
            return this.detectedCopters;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        startScanningForCopters: function() {
            var _this = this;
            if (!this.scanning) {
                this.scanning = true;
                this.doScanForCopters();
            }
        },

        /**
         *
         */
        stopScanningForCopters: function() {
            if (this.scanning) {
                this.scanning = false;
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        doScanForCopters: function() {
            if (this.scanning) {
                var _this = this;
                var copterFound = false;
                console.log("Scanning for copters...");
                var lostCopters = this.detectedCopters.clone();
                this.findCopters()
                    .then(function (copterSet) {
                        copterSet.forEach(function (copter) {
                            if (!_this.detectedCopters.contains(copter)) {
                                console.log("Copter found! path:", copter.getPath());
                                copterFound = true;
                                _this.processCopterDetected(copter);
                            } else {
                                lostCopters.remove(copter);
                            }
                        });

                        if (!copterFound) {
                            setTimeout(function () {
                                _this.doScanForCopters();
                            }, 2000);
                            console.log("No new copters found");
                        }
                        if (!lostCopters.isEmpty()) {
                            lostCopters.forEach(function (copter) {
                                console.log("Copter lost! path:", copter.getPath());
                                _this.processCopterLost(copter);
                            });
                        }
                    });
            }
        },

        /**
         * @private
         * @return {Set.<Copter>}
         */
        findCopters: function() {
            var _this           = this;
            var aerogelDriver   = new aerogel.CrazyDriver();
            return aerogelDriver.findCopters()
                .then(function(copterPaths) {
                    return Collections.ensureStreamable(copterPaths)
                        .stream()
                        .map(function(copterPath) {
                            return new Copter(aerogelDriver, copterPath);
                        })
                        .collectSync(Set);
                });
        },

        /**
         * @private
         * @param {Copter} copter
         */
        processCopterDetected: function(copter) {
            this.detectedCopters.add(copter);
            this.dispatchEvent(new Event(CopterManager.EventTypes.COPTER_DETECTED, {
                copter: copter
            }));
            this.stopScanningForCopters();
        },

        /**
         * @private
         * @param {Copter} copter
         */
        processCopterLost: function(copter) {
            this.detectedCopters.remove(copter);
            this.dispatchEvent(new Event(CopterManager.EventTypes.COPTER_LOST, {
                copter: copter
            }));
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    CopterManager.EventTypes = {
        COPTER_DETECTED: "CopterManager:EventTypes:CopterDetected",
        COPTER_LOST: "CopterManager:EventTypes:CopterLost"
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(CopterManager).with(
        module("copterManager")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('crazyflie.CopterManager', CopterManager);
});
