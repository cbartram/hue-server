/**
 * Provides a simple API Wrapper around Philips Hue Requests
 * to control lights
 *
 * Created by christianbartram on 9/10/17.
 * Github @cbartram
 */
const requestify = require('requestify');
const convert = require('color-convert');

let key; //API Key
let ip; //Hue bridge IPv4 Address

class Hue {
    constructor() {}

    /**
     * Initializes the key & ip to specific values
     * @param key String API Key
     * @param ip String IPV4 Address
     */
    init(key, ip) {
        this.key = key;
        this.ip = ip;
    }

    /**
     * Returns the Hue API Key
     * @returns {*}
     */
    getKey() {
        return this.key;
    }

    /**
     * Returns the Hue Bridge Ip address
     * @returns {*}
     */
    getIp() {
        return this.ip;
    }

    /**
     * Returns true if the API is initialized and false otherwise
     * @returns {boolean}
     */
    isInit() {
        return !(typeof this.key === 'undefined' || typeof this.ip === 'undefined');
    }


    /**
     * Fetches information about the Hue Bridge, Configuration, Groups, and lights.
     * @param callback Function
     */
    getAll(callback) {
        requestify.get(`http://${this.ip}/api/${this.key}`).then((response) => {
            callback(response.getBody());
        });
    }

    /**
     * Fetches information about all lights
     * @param callback Function
     */
    getLights(callback) {
        requestify.get(`http://${this.ip}/api/${this.key}/lights`).then((response) => {
            callback(response.getBody());
        });
    }

    /**
     * Gets current information about a specific light
     * @param id Integer light id (ex 1,2,3)
     * @param callback
     */
    getLight(id, callback) {
        requestify.get(`http://${this.ip}/api/${this.key}/lights/${id}`).then((response) => {
            callback(response.getBody());
        });
    }

    /**
     * TODO Make this method able to take both an ID or a light name
     * Turns a specific light off
     * @param id Integer light id
     * @param callback
     */
    off(id, callback) {
        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: false }).then((response) => {
            callback(response.getBody());
        });
    }

    /**
     * TODO Make this method able to take both an ID or a light name
     * Turns a specific light on
     * @param id Integer light id
     * @param callback
     */
    on(id, callback) {
        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true }).then((response) => {
            callback(response.getBody());
        });
    }

    /**
     * Turns all Lights off
     * @param callback
     */
    allOff(callback) {
        //Get all lights
        this.getLights((data) => {
            //For each light
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                  this.off(key, (c) => {
                      callback({success: true, state: 'off'});
                  })
                }
            }
        });
    }

    /**
     * Sets the brightness of a specific light
     * @param id String light id
     * @param value String value of the brightness 0, 254
     * @param callback Function callback
     */
    setBrightness(id, value, callback) {
        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, bri: value }).then((response) => {
            callback(response.getBody());
        });
    }

    /**
     * Sets all Light Brightness
     * @param value int value of the brightness 0, 254 inclusive
     * @param callback Function callback
     */
    setAllBrightness(value, callback) {
        this.getLights(data => {
            //For each light
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                    this.setBrightness(key, value, (c) => {
                        callback({success: true, bri: value});
                    })
                }
            }
        })
    }

    /**
     * Transitions a light from one color to a different color
     * @param id
     * @param primary
     * @param secondary
     * @param callback
     */
    transition(id, primary, secondary, callback) {
        let rgb = convert.hex.rgb(primary);
        let xy = this.toXY(rgb[0], rgb[1], rgb[2]);

        let rgb2 = convert.hex.rgb(secondary);
        let xy2 = this.toXY(rgb2[0], rgb2[1], rgb2[2]);

        //First request changes to the primary color
        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy}).then((response) => {
            //then transition to the secondary color
            requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy2, transitiontime: 40}).then((response) => {
                callback(response.getBody())
            });
        });
    }

    /**
     * Cancels a currently running color loop
     * @param id
     * @param callback
     */
    cancelColorLoop(id) {
        let responses = [];

        id.map(d => {
            requestify.put(`http://${this.ip}/api/${this.key}/lights/${d}/state/`, { effect: "none"}).then((response) => {
                //callback(response.getBody())
            });
        });

    }

    /**
     * Custom method which takes in a series of key value object properties
     * which will be passed on to the PUT request. This method allows the light
     * specified to do anything the user wants within the bounds of philips Hue's
     * capabilities
     * @param id Light id (1,2,3)
     * @param props Object a series of KV pair's
     * @param callback callback function
     *
     * Example of the props param:
     * {
     *  on: true,
     *  hue: 220,
     *  bri: 254,
     *  transitiontime: 20
     *  effect: 'none'
     * }
     */
    custom(id, props, callback) {
        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, props).then((response) => {
            callback(response.getBody())
        });
    }

    /**
     * Turns all the Lights on
     * @param callback
     */
    allOn(callback) {
        //Get all lights
        this.getLights((data) => {
            //For each light
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                    this.on(key, (c) => {
                        callback({success: true, state: 'on'});
                    })
                }
            }
        });
    }

    /**
     * Syncs the Lights by making them both the color white
     * @returns {{success: boolean, action: string, lights: string}}
     */
    sync() {
        this.setColorAll('#FFFFFF', () => {});

        return { success: true, action: 'sync', lights: 'all' }
    }

    /**
     * Sets the Light in a Rainbow Color Loop
     * @param id array of Integer Id's [1, 2, 3]
     * @param sync boolean true if lights should be synced to white before looped
     */
    setColorLoop(id, sync) {
        sync === true && this.sync();
        let responses = [];

        id.map(d => {
            requestify.put(`http://${this.ip}/api/${this.key}/lights/${d}/state/`, { effect:"colorloop" }).then((res) => {
                responses[d] = res;
            });
        });

    };

    /**
     * Flashes the Light for an Alert
     * @param id Light id
     * @param callback
     */
    alert(id, callback) {
        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { alert: "select" }) .then((res) => {
            callback(res.getBody());
        });
    }

    /**
     * Alerts a specific color
     * @param id Integer Light id
     * @param color String Hex color code
     * @param callback function
     */
    alertColor(id, color, callback) {
        let rgb = convert.hex.rgb(color);
        let xy = this.toXY(rgb[0], rgb[1], rgb[2]);

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { alert: "select", xy }) .then((res) => {
            callback(res.getBody());
        });
    }

    /**
     * Flashes all lights
     * @param callback Function
     */
    alertAll(callback) {
        //Get all lights
        this.getLights((data) => {
            //For each light
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                    this.alert(key, (data) => { callback(data) });
                }
            }
        });
    }

    /**
     * Turns all Lights a single color
     * @param color String hex color code
     * @param callback function
     */
    setColorAll(color, callback) {
        //Get all lights
        this.getLights((data) => {
            //For each light
            for(let key in data) {
                if(data.hasOwnProperty(key)) {
                    this.setColorHex(key, color, (data) => { callback(data) });
                }
            }
        });
    }


    /**
     * Sets the Lights color to Hex defined value
     * Note that this will automatically cancel any currently running color loop
     * @param id Integer light id
     * @param color String hex color including # ex #00ff00
     * @param callback
     */
    setColorHex(id, color, callback) {
        let rgb = convert.hex.rgb(color);
        let xy = this.toXY(rgb[0], rgb[1], rgb[2]);

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy, effect:'none' }).then((res) => {
           callback(res.getBody());
        });
    }

    /**
     * Sets the Lights color to RGB Defined value
     * @param id Integer Light id
     * @param color RGB Color as an array [0, 244, 120]
     * @param callback
     */
    setColorRgb(id, color, callback) {
        let xy = this.toXY(color[0], color[1], color[2]);

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy, effect:'none' }).then((res) => {
            callback(res.getBody());
        });
    }

    /**
     * Sets the Lights color to HSL defined value
     * @param id Integer Light id
     * @param color Array in HSL [120, 220, 450]
     * @param callback
     */
    setColorHsl(id, color, callback) {
        color = convert.hsl.rgb(color);
        let xy = this.toXY(color[0], color[1], color[2]);

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy, effect:'none' }).then((res) => {
            callback(res.getBody());
        });
    }

    /**
     * Function to convert to Philips Hue Lighting
     * @param red
     * @param green
     * @param blue
     * @returns {[*,*]}
     */
    toXY(red,green,blue) {
        //Gamma correction
        red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
        green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
        blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);

        //Apply wide gamut conversion D65
        let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
        let Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
        let Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

        let fx = X / (X + Y + Z);
        let fy = Y / (X + Y + Z);

        if (typeof fx === 'undefined' || fx === null) {
            fx = 0.0;
        }
        if (typeof fy === 'undefined' || fy === null) {
            fy = 0.0;
        }

        return [parseFloat(fx.toFixed(4)), parseFloat(fy.toFixed(4))];
    }


}
module.exports = Hue;
