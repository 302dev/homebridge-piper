//Super class for accessories
var request = require("request");
function PiperAccessory(){};
PiperAccessory.prototype = {
	_initialize: function(log, config, platform) {
		this.log = log;
		this.config = config;
		this.platform = platform;
		this.id = config.id;
		this.name = config.name;
		this.type = config.type;
		this.log("Setting up a Piper accessory of type " + this.type + " with name " + this.name + " (ID " + this.id + ")");

		this.infservice = new this.platform.Service.AccessoryInformation();
		this.infservice.setCharacteristic(this.platform.Characteristic.Manufacturer, "Piper");
		this.infservice.setCharacteristic(this.platform.Characteristic.Model, this.type);
		this.infservice.setCharacteristic(this.platform.Characteristic.SerialNumber, this.id);
	},

	getServices: function() {
		var services = [];
		services.push(this.infservice);
		services.push(this.service);
		return services;
	},

	getState: function(callback) {
		var pstate = this.platform.getKnownState(this.id);
		var state = this._translateState(pstate);
		if(state == undefined){
			this.log("Unkown state for accessory " + this.id + "'" + pstate + "' setting to default");
			state = this.getDefaultState();
			this.platform.setKnownState(this.id, state);
		}
		this.log("State of accessory " + this.name + " (ID " + this.id + "): " + state);
		if(callback) callback(null, state);
	},

	setState: function(state, callback) {
		var makerevent = "piperupdate_" + this.id + "_" + state;
		var thisurl = "https://maker.ifttt.com/trigger/" + makerevent + "/with/key/" + this.platform.makerkey;
		this.log("Trying to set state of accessory " + this.name + " (ID " + this.id + "): " + state + " With call to: " + thisurl);
		request.get(
			{url: thisurl,
			qs: { value1: this.id, value2: state }},
			function(err, response, body){
				if(err || response.statusCode != 200){
					this.log("Error setting state (status code %s): %s", response.statusCode, err);
				}
				if(callback) callback(null, state);
				this.log("Set state of accessory " + this.name + " (ID " + this.id + "): " + state + " With call to: " + thisurl);
			}.bind(this)
		);
	},

	processStateChange: function(receivedstate) {
		var state = this._translateState(receivedstate);
		if(state != undefined){
			this.platform.setKnownState(this.id, state);
			this._pushStateChange(state);
			this.log("State of accessory " + this.name + " (ID " + this.id + ") changed to " + state);
		}else{
			this.log("Tried to change state of accessory " + this.name + " (ID " + this.id + ") to invalid state " + receivedstate);
		}
	}
};

module.exports = PiperAccessory;
