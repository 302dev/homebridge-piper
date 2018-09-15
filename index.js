var PiperContactSensor = require('./lib/contactsensor.js');
var PiperSecuritySystem = require('./lib/securitysystem.js');
var PiperMotionSensor = require('./lib/motionsensor.js');
var PiperCamera = require('./lib/camera.js');
var http = require('http');

var Characteristic, Service;

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-piper", "Piper", PiperPlatform);
};

function PiperPlatform(log, config) {
  this.log = log;
  this.config = config;
  this.Service = Service;
  this.Characteristic = Characteristic;

  this.makerkey = this.config.makerkey;
  this.pitoken = this.config.pitoken;
  this.serverport = parseInt(this.config.serverport);

  //Initialize accessories
  this._initializeAccessories(this.config.devices);

  //Install HTTP server
  this.requestServer = http.createServer(this._handleRequest.bind(this));
  this.requestServer.listen(this.serverport, function() {
    this.log("Server listening on port " +this.serverport+ "...");
  }.bind(this));
};

PiperPlatform.prototype.accessories = function(callback) {
  this.log("Retrieving accessories for Piper");
  var accessories = [];
  for (var id in this.myaccessories) {
    accessories.push(this.myaccessories[id]);
  }
  callback(accessories);
};

PiperPlatform.prototype._handleRequest = function(request, response) {
  if(request.url == "/" + this.pitoken) {
    this.log("Valid web request received");
    if(request.method == 'POST') {
      var queryData = "";
      request.on('data', function(data) {
        queryData += data;
        if(queryData.length > 1e6) {
          queryData = "";
          response.writeHead(413, {'Content-Type': 'text/plain'});
          response.end();
          request.connection.destroy();
        }
      });
      request.on('end', function() {
            //Get the querydat, parse id and call _processStatusUpdate
        response.writeHead(204, {'Content-Type': 'text/plain'});
        response.end();

        try{
          var jso = JSON.parse(queryData);
          if(jso.id != undefined && jso.state != undefined){
            this._handleStateChange(jso.id, jso.state);
          }
        }catch(err){
          this.log("Invalid JSON input: " + err);
        }
      }.bind(this));
    } else {
      response.writeHead(405, {'Content-Type': 'text/plain'});
      response.end();
    }
  }else{
    this.log("Received invalid url " + request.url + ", returning 403");
    response.writeHead(403, {'Content-Type': 'text/plain'});
    response.end();
  }
};

PiperPlatform.prototype._handleStateChange = function(id, state) {
  if(id in this.myaccessories){
    this.myaccessories[id].processStateChange(state);
  }
}

PiperPlatform.prototype._initializeAccessories = function(devices) {
  this.log("Initializing piper accessories");
  this.myaccessories = {};
  this.states = {};
  for (var id in devices) {
    if (devices.hasOwnProperty(id)) {
        var aconfig = devices[id];
      var acc = undefined;
      switch(aconfig.type){
        case "SecuritySystem":
          acc = new PiperSecuritySystem(this.log, aconfig, this);
          break;
        case "ContactSensor":
          acc = new PiperContactSensor(this.log, aconfig, this);
          break;
        case "MotionSensor":
          acc = new PiperMotionSensor(this.log, aconfig, this);
          break;
        case "Camera":
          acc = new PiperCamera(this.log, aconfig, this);
          break;
        default:
          this.log("Accessory has invalid type '" + aconfig.type + "' and will be ignored");
      }
      if(acc != undefined){
        this.myaccessories[acc.id] = acc;
        this.setKnownState(acc.id, acc.getDefaultState());
      }
    }
  }
};

PiperPlatform.prototype.setKnownState = function(id, state) {
  if(id in this.myaccessories){
    this.states[id] = state;
  }else{
    this.log("WARNING: Tried to set state of unknown accessory");
  }
};

PiperPlatform.prototype.getKnownState = function(id) {
  if(id in this.states) {
    return this.states[id];
  }else{
    return undefined;
  }
};
