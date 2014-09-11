/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * crazyflie may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('crazyflie.RadioManager')

//@Require('Class')
//@Require('Collections')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Obj')
//@Require('Set')
//@Require('bugioc.ModuleTag')
//@Require('bugmeta.BugMeta')
//@Require('crazyflie.Radio')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var usb                 = require('usb');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Collections         = bugpack.require('Collections');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Obj                 = bugpack.require('Obj');
    var Set                 = bugpack.require('Set');
    var ModuleTag           = bugpack.require('bugioc.ModuleTag');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');
    var Radio               = bugpack.require('crazyflie.Radio');


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
    var RadioManager = Class.extend(EventDispatcher, {

        _name: "crazyflie.RadioManager",


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
             * @type {Set.<Radio>}
             */
            this.detectedRadios         = Collections.set();

            /**
             * @private
             * @type {boolean}
             */
            this.scanning               = false;

            /**
             * @private
             * @type {number}
             */
            this.scanningIntervalId     = null;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Set.<Radio>}
         */
        getDetectedRadios: function() {
            return this.detectedRadios;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        startScanningForRadios: function() {
            var _this = this;
            if (!this.scanning) {
                this.scanning = true;
                this.scanningIntervalId = setInterval(function() {
                    _this.doScanForRadios();
                }, 2000);
                this.doScanForRadios();
            }
        },

        /**
         *
         */
        stopScanningForRadios: function() {
            if (this.scanning) {
                this.scanning = false;
                clearInterval(this.scanningIntervalId);
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        doScanForRadios: function() {
            var _this = this;
            var radioFound = false;
            console.log("Scanning for CrazyRadios...");
            var lostRadios  = this.detectedRadios.clone();
            var radioSet    = this.findRadios();
            radioSet.forEach(function(radio) {
                if (!_this.detectedRadios.contains(radio)) {
                    console.log("Radio found! idVendor:", radio.getDevice().deviceDescriptor.idVendor);
                    radioFound = true;
                    _this.processRadioDetected(radio);
                } else {
                    lostRadios.remove(radio);
                }
            });

            if (!radioFound) {
                console.log("No new radios found");
            }
            if (!lostRadios.isEmpty()) {
                lostRadios.forEach(function(radio) {
                    //console.log("Radio lost! path:", radio.getPath());
                    _this.processRadioLost(radio);
                });
            }
        },

        /**
         * @private
         * @return {Set.<Radio>}
         */
        findRadios: function() {
            var devices = usb.getDeviceList();
            return Collections.ensureStreamable(devices)
                .stream()
                .filter(function(device) {
                    console.log(device.deviceDescriptor);
                    return ((device.deviceDescriptor.idVendor == Radio.ID_VENDOR) && (device.deviceDescriptor.idProduct == Radio.ID_PRODUCT));
                })
                .map(function(device) {
                    return new Radio(device);
                })
                .collectSync(Set);
        },

        /**
         * @private
         * @param {Radio} radio
         */
        processRadioDetected: function(radio) {
            this.detectedRadios.add(radio);
            this.dispatchEvent(new Event(RadioManager.EventTypes.RADIO_DETECTED, {
                radio: radio
            }));
        },

        /**
         * @private
         * @param {Radio} radio
         */
        processRadioLost: function(radio) {
            this.detectedRadios.remove(radio);
            this.dispatchEvent(new Event(RadioManager.EventTypes.RADIO_LOST, {
                radio: radio
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
    RadioManager.EventTypes = {
        RADIO_DETECTED: "RadioManager:EventTypes:RadioDetected",
        RADIO_LOST: "RadioManager:EventTypes:RadioLost"
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(RadioManager).with(
        module("radioManager")
    );


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('crazyflie.RadioManager', RadioManager);
});
