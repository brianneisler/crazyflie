/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * crazyflie may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('crazyflie.Radio')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Obj')
//@Require('TypeUtil')


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
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Obj                 = bugpack.require('Obj');
    var TypeUtil            = bugpack.require('TypeUtil');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var Radio = Class.extend(EventDispatcher, {

        _name: "crazyflie.Radio",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {*} device
         */
        _constructor: function(device) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {number}
             */
            this.channel    = null;

            /**
             * @private
             * @type {Radio.DATA_RATE}
             */
            this.dataRate   = null;

            /**
             * @private
             * @type {*}
             */
            this.device     = device;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {number}
         */
        getChannel: function() {
            return this.channel;
        },

        /**
         * @return {Radio.DATA_RATE}
         */
        getDataRate: function() {
            return this.dataRate;
        },

        /**
         * @return {*}
         */
        getDevice: function() {
            return this.device;
        },


        //-------------------------------------------------------------------------------
        // Obj Methods
        //-------------------------------------------------------------------------------

        /**
         * @override
         * @param {*} value
         * @return {boolean}
         */
        equals: function(value) {
            if (Class.doesExtend(value, Radio)) {
                return (Obj.equals(value.getDevice().deviceDescriptor.idVendor, this.device.deviceDescriptor.idVendor)
                    && Obj.equals(value.getDevice().deviceDescriptor.idProduct, this.device.deviceDescriptor.idProduct));
            }
            return false;
        },

        /**
         * @override
         * @return {number}
         */
        hashCode: function() {
            if (!this._hashCode) {
                this._hashCode = Obj.hashCode("[Radio]" +
                    Obj.hashCode(this.device.deviceDescriptor.idVendor) + Obj.hashCode(this.device.deviceDescriptor.idProduct));
            }
            return this._hashCode;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        setupRadio: function(channel, datarate) {
            this.channel = (_.isUndefined(channel) ? 2 : channel);
            this.datarate = (_.isUndefined(datarate) ? 2 : datarate);

            // console.log('setting up radio at ', channel, datarate);

            this.device.open();
            this.interface = this.device.interfaces[0];
            this.interface.claim();
            this.inEndpoint = this.interface.endpoints[0];
            this.outEndpoint = this.interface.endpoints[1];

            this.version = parseFloat(util.format('%d.%d', this.device.deviceDescriptor.bcdDevice >> 8, this.device.deviceDescriptor.bcdDevice & 0x0ff));
            if (this.version < 0.4)
                throw(new Error('this driver requires at least version 0.4 of the radio firmware; ' + this.version));

            var input = this.inputStream();
            input.addListener('readable', this.onReadable.bind(this));
            input.addListener('error', this.onInputError.bind(this));

            // Last-ditch heartbeat to get data from the copter every second.
            this.pingInterval = setInterval(this.ping.bind(this), 1000);

            return this.reset();
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    Radio.DATA_RATE = {
        "250KPS": 0,
        "1MPS":   1,
        "2MPS":   2
    };

    /**
     * @static
     * @const {number}
     */
    Radio.ID_PRODUCT = 30583;

    /**
     * @static
     * @const {number}
     */
    Radio.ID_VENDOR = 6421;


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('crazyflie.Radio', Radio);
});
