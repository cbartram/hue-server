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

    init(key, ip) {
        this.key = key;
        this.ip = ip;
    }

    getKey() {
        return this.key;
    }

    getIp() {
        return this.ip;
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
     */
    setColorLoop(id) {
        this.sync();

        id.map(d => { requestify.put(`http://${this.ip}/api/${this.key}/lights/${d}/state/`, { on: true, effect:'colorloop' }).then((res) => {}); });
        return { state: 'looping', lights: id }
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
     * @param id Integer light id
     * @param color String hex color including # ex #00ff00
     * @param callback
     */
    setColorHex(id, color, callback) {
        let rgb = convert.hex.rgb(color);
        let xy = this.toXY(rgb[0], rgb[1], rgb[2]);

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy }).then((res) => {
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

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy }).then((res) => {
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

        requestify.put(`http://${this.ip}/api/${this.key}/lights/${id}/state/`, { on: true, xy }).then((res) => {
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
