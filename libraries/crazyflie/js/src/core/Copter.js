/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * evolution-drone may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('crazyflie.Copter')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Obj                 = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var Copter = Class.extend(EventDispatcher, {

        _name: "crazyflie.Copter",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {*} aerogelDriver
         * @param {string} path
         */
        _constructor: function(aerogelDriver, path) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {*}
             */
            this.aerogelDriver      = aerogelDriver;

            /**
             * @private
             * @type {boolean}
             */
            this.connected          = false;

            /**
             * @private
             * @type {boolean}
             */
            this.connecting         = false;

            /**
             * @private
             * @type {string}
             */
            this.path               = path;

            this.stabilizer         = {
                yaw: null,
                pitch: null,
                roll: null,
                thrust: null
            };
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
         * @return {string}
         */
        getPath: function() {
            return this.path;
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
            if (Class.doesExtend(value, Copter)) {
                return (Obj.equals(value.getPath(), this.path));
            }
            return false;
        },

        /**
         * @override
         * @return {number}
         */
        hashCode: function() {
            if (!this._hashCode) {
                this._hashCode = Obj.hashCode("[Copter]" +
                    Obj.hashCode(this.path));
            }
            return this._hashCode;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        connectToCopter: function() {
            var _this = this;
            if (!this.connected && !this.connecting) {
                console.log("Connecting to copter...");
                this.connecting = true;
                this.aerogelDriver.connect(this.path)
                    .then(function() {
                        console.log("Copter connected!");
                        _this.connected = true;
                        _this.connecting = false;
                        _this.setupDriverListeners();
                        _this.dispatchEvent(new Event(Copter.EventTypes.CONNECTED));
                        return true;
                    });
            }
        },

        /**
         * @param {number} roll
         * @param {number} pitch
         * @param {number} yaw
         * @param {number} thrust
         */
        setPoint: function(roll, pitch, yaw, thrust) {
            //TEST
            console.log("SetPoint - roll:", roll, " pitch:", pitch, " yaw:", yaw, " thrust:", thrust);
            this.aerogelDriver.setpoint(roll, pitch, yaw, thrust);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        setupDriverListeners: function() {
            var _this = this;
            this.aerogelDriver.telemetry.subscribe('accelerometer', function(data) {
                console.log('acc:', data);
                _this.dispatchEvent(new Event(Copter.EventTypes.DATA_ACCELEROMETER, data));
            });
            this.aerogelDriver.telemetry.subscribe('gyro', function(data) {
                console.log('gyro:', data);
                _this.dispatchEvent(new Event(Copter.EventTypes.DATA_GYRO, data));
            });
            this.aerogelDriver.telemetry.subscribe('motor', function(data) {
                console.log('motor:', data);
                _this.dispatchEvent(new Event(Copter.EventTypes.DATA_MOTOR, data));
            });
            this.aerogelDriver.telemetry.subscribe('stabilizer', function(data) {
                console.log('stabilizer:', data);
                _this.stabilizer = data;
                _this.dispatchEvent(new Event(Copter.EventTypes.DATA_STABILIZER, data));
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    Copter.EventTypes = {
        CONNECTED: "Copter:EventTypes:Connected",
        DATA_ACCELEROMETER: "Copter:EventTypes:DataAccelerometer",
        DATA_GYRO: "Copter:EventTypes:DataGyro",
        DATA_MOTOR: "Copter:EventTypes:DataMotor",
        DATA_STABILIZER: "Copter:EventTypes:DataStabilizer",
        DISCONNECTED: "Copter:EventTypes:Disconnected"
    };

    /**
     * @static
     * @const {number}
     */
    Copter.MAX_THRUST = 60000;

    /**
     * @static
     * @const {number}
     */
    Copter.MIN_THRUST = 10001;

    /**
     * @static
     * @const {number}
     */
    Copter.MAX_PITCH = 45;

    /**
     * @static
     * @const {number}
     */
    Copter.MAX_ROLL = 45;

    /**
     * @static
     * @const {number}
     */
    Copter.MAX_YAW = 360;


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('crazyflie.Copter', Copter);
});
