/*
 * Copyright (c) 2014 Brian Neisler. http://brianneisler.com
 *
 * crazyflie may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

var bugpack     = require("bugpack").loadContextSync(module);
bugpack.loadExportSync("crazyflie.Crazyflie");
var Crazyflie   = bugpack.require("crazyflie.Crazyflie");


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = Crazyflie.getInstance();
