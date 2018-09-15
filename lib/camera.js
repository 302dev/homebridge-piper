var inheritsFrom = require('./inheritance.js');
var PiperAccessory = require('./accessory.js');
//Piper camera
function PiperCamera(log, config, platform) {
    this._initialize(log, config, platform);
    //Setup the service
    this.service = new this.platform.Service.Camera(this.name);
    // Not sure what this would be at the moment
    //this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState).on('get', this.getState.bind(this));
};
inheritsFrom(PiperCamera, PiperAccessory);

module.exports = PiperCamera;
