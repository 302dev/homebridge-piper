var inheritsFrom = require('./inheritance.js');
var PiperAccessory = require('./accessory.js');
//Security system accessory
function PiperSecuritySystem(log, config, platform) {
  this._initialize(log, config, platform);
  //Setup the service
  this.service = new this.platform.Service.SecuritySystem(this.name);
  this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState).on('get', this.getState.bind(this));
  this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemTargetState).on('get', this.getState.bind(this));
  this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemTargetState).on('set', this.setState.bind(this));
};
inheritsFrom(PiperSecuritySystem, PiperAccessory);

PiperSecuritySystem.prototype.getDefaultState = function() {
  return this.platform.Characteristic.SecuritySystemCurrentState.DISARMED;
};

PiperSecuritySystem.prototype._translateState = function(pstate) {
  switch(pstate){
    case 0:
    case "0":
      return this.platform.Characteristic.SecuritySystemCurrentState.STAY_ARM;
    case 1:
    case "1":
      return this.platform.Characteristic.SecuritySystemCurrentState.AWAY_ARM;
    case 2:
    case "2":
      return this.platform.Characteristic.SecuritySystemCurrentState.NIGHT_ARM;
    case 3:
    case "3":
      return this.platform.Characteristic.SecuritySystemCurrentState.DISARMED;
    case undefined:
    default:
      return undefined;
  }
};

PiperSecuritySystem.prototype._pushStateChange= function(state) {
  this.service.getCharacteristic(this.platform.Characteristic.SecuritySystemCurrentState).setValue(state);
};

module.exports = PiperSecuritySystem;
