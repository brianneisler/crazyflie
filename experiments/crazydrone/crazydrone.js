var bugcore         = require('bugcore');
var crazyflie       = require('crazyflie');
var evolution       = require('evolution-drone');

var Class           = bugcore.Class;
var Collections     = bugcore.Collections;
var Event           = bugcore.Event;
var EventDispatcher = bugcore.EventDispatcher;
var Exception       = bugcore.Exception;
var Obj             = bugcore.Obj;
var Set             = bugcore.Set;
var Copter          = crazyflie.Copter;
var CopterManager   = crazyflie.CopterManager;
var CopterService   = crazyflie.CopterService;
var Radio           = crazyflie.Radio;
var RadioManager    = crazyflie.RadioManager;
var DeviceDataEvent = evolution.DeviceDataEvent;
var DeviceManager   = evolution.DeviceManager;
var DeviceService   = evolution.DeviceService;


/**
 * @class
 * @extends {Obj}
 */
var ControlDelegate = Class.extend(Obj, {

    _name: "crazyflie.ControlDelegate",


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Device} device
     * @param {Copter} copter
     */
    _constructor: function(device, copter) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Copter}
         */
        this.copter         = copter;

        /**
         * @private
         * @type {Device}
         */
        this.device         = device;

        /**
         * @private
         * @type {ControlDelegate.Modes}
         */
        this.controlMode    = ControlDelegate.Modes.DAVE_REVERSE;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Copter}
     */
    getCopter: function() {
        return this.copter;
    },

    /**
     * @return {Device}
     */
    getDevice: function() {
        return this.device;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    startControl: function() {
        //TEST
        console.log("Control delegated!");
        var _this = this;
        this.device.addEventListener(DeviceDataEvent.EventTypes.DATA, function(event) {
            var data = event.getData();
            var yaw = 0;
            var thrust = 0;
            var roll = 0;
            var pitch = 0;

            switch (_this.controlMode) {
                case ControlDelegate.Modes.ONE:
                    if (data.rightStick.x) {
                        yaw = (data.rightStick.x / 128) * Copter.MAX_YAW;
                    }
                    if (data.rightStick.y > 0) {
                        thrust = Math.floor(Copter.MIN_THRUST + ((Copter.MAX_THRUST - Copter.MIN_THRUST) * (data.rightStick.y / 128)));
                    }
                    if (data.leftStick.x) {
                        roll = (data.leftStick.x / 128) * Copter.MAX_ROLL;
                    }
                    if (data.leftStick.y) {
                        pitch = (data.leftStick.y / 128) * Copter.MAX_PITCH;
                    }
                    break;
                case ControlDelegate.Modes.TWO:
                    if (data.leftStick.x) {
                        yaw = (data.leftStick.x / 128) * Copter.MAX_YAW;
                    }
                    if (data.leftStick.y > 0) {
                        thrust = Math.floor(Copter.MIN_THRUST + ((Copter.MAX_THRUST - Copter.MIN_THRUST) * (data.leftStick.y / 128)));
                    }
                    if (data.rightStick.x) {
                        roll = (data.rightStick.x / 128) * Copter.MAX_ROLL;
                    }
                    if (data.rightStick.y) {
                        pitch = (data.rightStick.y / 128) * Copter.MAX_PITCH;
                    }
                    break;
                case ControlDelegate.Modes.DAVE_REVERSE:
                    if (data.rt) {
                        yaw = Copter.MAX_YAW / 2;
                    }
                    if (data.lt) {
                        yaw = -(Copter.MAX_YAW / 2);
                    }
                    if (data.rightStick.y > 0) {
                        thrust = Math.floor(Copter.MIN_THRUST + ((Copter.MAX_THRUST - Copter.MIN_THRUST) * (data.rightStick.y / 128)));
                    }
                    if (data.leftStick.x) {
                        roll = (data.leftStick.x / 128) * Copter.MAX_ROLL;
                    }
                    if (data.leftStick.y) {
                        pitch = (data.leftStick.y / 128) * Copter.MAX_PITCH;
                    }
                    break;
                case ControlDelegate.Modes.DAVE:
                    if (data.rt) {
                        yaw = Copter.MAX_YAW / 2;
                    }
                    if (data.lt) {
                        yaw = -(Copter.MAX_YAW / 2);
                    }
                    if (data.leftStick.y > 0) {
                        thrust = Math.floor(Copter.MIN_THRUST + ((Copter.MAX_THRUST - Copter.MIN_THRUST) * (data.leftStick.y / 128)));
                    }
                    if (data.rightStick.x) {
                        roll = (data.rightStick.x / 128) * Copter.MAX_ROLL;
                    }
                    if (data.rightStick.y) {
                        pitch = (data.rightStick.y / 128) * Copter.MAX_PITCH;
                    }
                    break;
            }
            _this.copter.setPoint(roll, pitch, yaw, thrust);
        });
    }
});

ControlDelegate.Modes = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    DAVE: 4,
    DAVE_REVERSE: 5
};

/**
 * @class
 * @extends {Obj}
 */
var ControlDelegator = Class.extend(Obj, {

    _name: "crazyflie.ControlDelegator",


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function(copterManager, deviceManager) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {CopterManager}
         */
        this.copterManager          = copterManager;

        /**
         * @private
         * @type {Map.<Copter, ControlDelegate>}
         */
        this.copterToDelegateMap    = Collections.map();

        /**
         * @private
         * @type {DeviceManager}
         */
        this.deviceManager          = deviceManager;

        /**
         * @private
         * @type {Map.<Device, ControlDelegate>}
         */
        this.deviceToDelegateMap    = Collections.map();
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

    /**
     * @return {DeviceManager}
     */
    getDeviceManager: function() {
        return this.deviceManager;
    },


    //-------------------------------------------------------------------------------
    // IInitializingModule Implementation
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Throwable=)} callback
     */
    deinitializeModule: function(callback) {
        this.copterManager.removeEventListener(CopterManager.EventTypes.COPTER_LOST, this.hearCopterLost, this);
        this.deviceManager.removeEventListener(DeviceManager.EventTypes.DEVICE_LOST, this.hearDeviceLost, this);
        callback();
    },

    /**
     * @param {function(Throwable=)} callback
     */
    initializeModule: function(callback) {
        this.copterManager.addEventListener(CopterManager.EventTypes.COPTER_LOST, this.hearCopterLost, this);
        this.deviceManager.addEventListener(DeviceManager.EventTypes.DEVICE_LOST, this.hearDeviceLost, this);
        callback()
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Device} device
     * @param {Copter} copter
     */
    delegateControl: function(device, copter) {
        //TEST
        console.log("Delegating control...");

        if (this.deviceToDelegateMap.containsKey(device)) {
            throw new Exception("IllegalState", {}, "Device is already delegated to control another Copter");
        }
        if (this.copterToDelegateMap.containsKey(copter)) {
            throw new Exception("IllegalState", {}, "Copter is already delegated for control to another Device");
        }
        var controlDelegate = new ControlDelegate(device, copter);
        this.copterToDelegateMap.put(copter, controlDelegate);
        this.deviceToDelegateMap.put(device, controlDelegate);
        controlDelegate.startControl();
    },


    //-------------------------------------------------------------------------------
    // Event Listeners
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Event} event
     */
    hearCopterLost: function(event) {
        //TODO
    },

    /**
     * @private
     * @param {Event} event
     */
    hearDeviceLost: function(event) {
        //TODO
    }
});


/**
 * @class
 * @extends {Obj}
 */
var ControlService = Class.extend(Obj, {

    _name: "crazyflie.ControlService",


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {CopterManager} copterManager
     * @param {DeviceManager} deviceManager
     * @param {ControlDelegator} controlDelegator
     */
    _constructor: function(copterManager, deviceManager, controlDelegator) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {ControlDelegator}
         */
        this.controlDelegator   = controlDelegator;

        /**
         * @private
         * @type {CopterManager}
         */
        this.copterManager      = copterManager;

        /**
         * @private
         * @type {DeviceManager}
         */
        this.deviceManager      = deviceManager;

        /**
         * @private
         * @type {Copter}
         */
        this.waitingCopter      = null;

        /**
         * @private
         * @type {Device}
         */
        this.waitingDevice      = null;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {ControlDelegator}
     */
    getControlDelegator: function() {
        return this.controlDelegator;
    },

    /**
     * @return {CopterManager}
     */
    getCopterManager: function() {
        return this.copterManager;
    },

    /**
     * @return {DeviceManager}
     */
    getDeviceManager: function() {
        return this.deviceManager;
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
        this.deviceManager.removeEventListener(DeviceManager.EventTypes.DEVICE_DETECTED, this.hearDeviceDetected, this);
        this.deviceManager.removeEventListener(DeviceManager.EventTypes.DEVICE_LOST, this.hearDeviceLost, this);
        callback();
    },

    /**
     * @param {function(Throwable=)} callback
     */
    initializeModule: function(callback) {
        this.copterManager.addEventListener(CopterManager.EventTypes.COPTER_DETECTED, this.hearCopterDetected, this);
        this.copterManager.addEventListener(CopterManager.EventTypes.COPTER_LOST, this.hearCopterLost, this);
        this.deviceManager.addEventListener(DeviceManager.EventTypes.DEVICE_DETECTED, this.hearDeviceDetected, this);
        this.deviceManager.addEventListener(DeviceManager.EventTypes.DEVICE_LOST, this.hearDeviceLost, this);
        callback()
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Copter} copter
     */
    processCopter: function(copter) {

        //TODO BRN: This is pretty hacky. Would be better if there was a UI selection method for this.

        if (this.waitingDevice) {
            this.controlDelegator.delegateControl(this.waitingDevice, copter);
            this.waitingDevice = null;
        } else {

            //TEST
            console.log("Have waiting copter");

            this.waitingCopter = copter;
        }
    },

    /**
     * @private
     * @param {Device} device
     */
    processDevice: function(device) {

        //TODO BRN: This is pretty hacky. Would be better if there was a UI selection method for this.

        if (this.waitingCopter) {
            this.controlDelegator.delegateControl(device, this.waitingCopter);
            this.waitingCopter = null;
        } else {

            //TEST
            console.log("Have waiting device");

            this.waitingDevice = device;
        }
    },


    //-------------------------------------------------------------------------------
    // Event Listeners
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Event} event
     */
    hearCopterDetected: function(event) {

        //TEST
        console.log("MADE IT!!");

        this.processCopter(event.getData().copter);
    },

    /**
     * @private
     * @param {Event} event
     */
    hearCopterLost: function(event) {
        //TODO
    },

    /**
     * @private
     * @param {Event} event
     */
    hearDeviceDetected: function(event) {
        this.processDevice(event.getData().device);
    },

    /**
     * @private
     * @param {Event} event
     */
    hearDeviceLost: function(event) {
        //TODO
    }
});




//-------------------------------------------------------------------------------
// Script Code
//-------------------------------------------------------------------------------

/*var radioManager        = new RadioManager();

radioManager.startScanningForRadios();*/


var copterManager       = new CopterManager();
var copterService       = new CopterService(copterManager);
var deviceManager       = new DeviceManager();
var deviceService       = new DeviceService(deviceManager);
var controlDelegator    = new ControlDelegator(copterManager, deviceManager);
var controlService      = new ControlService(copterManager, deviceManager, controlDelegator);

controlDelegator.initializeModule(function() {
    console.log("ControlDelegator initialized");
});

controlService.initializeModule(function() {
    console.log("ControlService initialized");
});

deviceService.initializeModule(function() {
    console.log("DeviceService initialized");
});

copterService.initializeModule(function() {
    console.log("CopterService initialized");
});


