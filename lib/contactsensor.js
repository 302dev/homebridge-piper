var inheritsFrom = require('./inheritance.js');
var PiperAccessory = require('./accessory.js');
//Piper contact sensory accessory
function PiperContactSensor(log, config, platform) {
    this._initialize(log, config, platform);
    //Setup the service
    this.service = new this.platform.Service.ContactSensor(this.name);
    this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState).on('get', this.getState.bind(this));
};
inheritsFrom(PiperContactSensor, PiperAccessory);

PiperContactSensor.prototype.getDefaultState = function() {
    return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
};

PiperContactSensor.prototype._translateState = function(pstate) {
    switch(pstate){
        case 0:
        case "0":
            return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        case 1:
        case "1":
            return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        case undefined:
        default:
            return undefined;
    }
};


PiperContactSensor.prototype._pushStateChange= function(state) {
    this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState).setValue(state);
};

module.exports = PiperContactSensor;
