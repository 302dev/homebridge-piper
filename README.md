#Piper homebridge plugin

I need to update the below instructions to make them clearer to the end user.

This is a [homebridge](https://github.com/nfarina/homebridge) plugin for the [Piper](https://getpiper.com) security system.
As currently there is no public API available, this plugin works in combination with [IFTTT](https://ifttt.com) rules.

##Example config.json
```
{
    ...
    "platforms": [
        {
            "platform": "Piper",
            "serverport": <server_port>,
            "makerkey": "<your_maker_key>",
            "pitoken": "<your_pi_token>",
            "devices": [
              {
                "type": "SecuritySystem",
                "id": "security",
                "name": "Alarmsysteem"
              }
            ]
        }
    ]
    ...
}
```

##Configuration requirements
The following configurations need to be performed for the homebridge-piper plugin to run:

1. Install and configure homebridge on your Raspberry Pi as described [here](https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi)
2. Install the homebridge-piper plugin through npm ```npm install -g homebridge-piper```
3. Setup, for each ```<security_mode>``` 0-3, a rule on IFTTT using the [Maker channel](https://ifttt.com/maker) and [Piper channel](https://ifttt.com/piper) to be able to change the piper security state through a web request:
  - IF Maker receive web request
    - Event name ```piperupdate_security_<security_mode>```
  - THEN Piper change security mode
  - Security mode 0: Stay, 1: Away, 2: Stay, 3: Disarmed (2x stay because homekit has 4 security states while piper has 3. Homekit night and stay mode both map to piper stay mode)
4. Setup, for each ```<security_mode>``` 0-3, a rule on IFTTT using the [Maker channel](https://ifttt.com/maker) to provide a callback to the Raspberry Pi that the status has changed. Ideal would be to trigger this event when the piper mode has changed, but this is not provided by the Piper IFTTT channel. Therefore, on an incoming maker web request, we both change the piper status and do the callback. At least then we know the IFTTT rule matched. When the Piper channel will introduce a trigger on security mode change, the if condition of this rule can be changed.
  - IF Maker receive web request
    - Event name ```piperupdate_security_<security_mode>```
  - THEN Maker make web request
    - Web request url ```http://<your_wan_ip_address>:<server_port>/<your_pi_token>```. Where ```<server_port>``` and ```<your_pi_token>``` match the values provided in the config file. This 'secret' pi token provides a level of security to avoid unappropriate access to the security state.
    - Method ```POST```
    - Content type ```application/json```
    - Body ```{"id": "{{Value1}}", "state": "{{Value2}}"}```
3. Configure you ```config.json``` file with your maker key (provided by IFTTT when connecting to the Maker channel) and pi token chosen above.
4. Make sure that your Raspberry Pi is reachable on the provided port number. This might require port forwarding on your router.
