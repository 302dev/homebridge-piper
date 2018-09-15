var inheritsFrom = require('./inheritance.js');
var PiperAccessory = require('./accessory.js');
//Piper contact sensory accessory
function PiperMotionSensor(log, config, platform) {
	this._initialize(log, config, platform);
	//Setup the service
	this.service = new this.platform.Service.MotionSensor(this.name);
	this.service.getCharacteristic(this.platform.Characteristic.MotionDetected).on('get', this.getState.bind(this));
	//Setup variable for timers
	this.timer = undefined;
};
inheritsFrom(PiperMotionSensor, PiperAccessory);

PiperMotionSensor.prototype.getDefaultState = function() {
	return false;
};

PiperMotionSensor.prototype._translateState = function(pstate) {
	switch(pstate){
		case 0:
		case "0":
		case false:
		case "false":
			return false;
		case 1:
		case "1":
		case true:
		case "true":
			return true;
		case undefined:
		default:
			return undefined;
	}
};


PiperMotionSensor.prototype._pushStateChange= function(state) {
	var cnl = this.timer;
	this.timer = undefined;
	this.service.getCharacteristic(this.platform.Characteristic.MotionDetected).setValue(state);
	
	//If motion detected, set back to false in 2 minutes
	if(state == true){
		var _this = this;
		this.timer = setTimeout(function(){_this.processStateChange("false");}, 120000);
	}

	//Check if previous timer has to be cancelled
	if(cnl != undefined){
		clearTimeout(cnl);
	}
};

module.exports = PiperMotionSensor;
