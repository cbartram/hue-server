/**
 * Created by christianbartram on 9/13/17.
 */
let BASE_URL = "http://localhost:3000";


module.exports = {

    /**
     * Sets the Base URL to use default is localhost:3000
     * @param url String server URL
     */
    setURL(url) {
        BASE_URL = url;
    },

    /**
     * Returns the currently set server url
     * @returns {string}
     */
    getURL() {
        return BASE_URL;
    },

    /**
     * This method asks the server
     * @param user
     * @param callback
     */
    getLights(user, callback) {
        fetch(`${BASE_URL}/lights?key=${user.key}&ip=${user.ip}`)
            .then((response) => response.json())
            .then((responseJson) => {
                callback(responseJson);
            }).catch((error) => {
            console.error(error);
        });
    },

    /**
     * Sets the light into an infinite color rainbow loop
     * @param ids
     * @param callback
     */
    colorLoop(ids, callback) {
        fetch(`${BASE_URL}/lights/action/loop`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids,
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                callback(responseJson);
            }).catch((error) => {
            console.error(error);
        });
    },

    /**
     * Flashes the given light quickly
     * @param lights
     * @param callback
     */
    flash(lights, callback) {
        fetch(`${BASE_URL}/lights/action/flash`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lights: lights,
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                callback(responseJson);
            }).catch((error) => {
            console.error(error);
        });
    },

    transition(ids, primary, secondary, callback) {
        fetch(`${BASE_URL}/lights/action/transition`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids,
                primary,
                secondary
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                callback(responseJson);
            }).catch((error) => {
            console.error(error);
        });
    },

    /**
     * Turns a selected set of lights on
     * @param ids array of integer light key's
     */
    lightOn(ids) {
        fetch(`${BASE_URL}/lights/action/on`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ids})
        })
    },

    /**
     * Turns all lights on regardless of what is selected
     */
    on() {
        fetch(`${BASE_URL}/on`)
            .then((response) => response.json())
            .then((responseJson) => {
                //Do something with response
            }).catch((error) => {
            console.error(error);
        });
    },

    /**
     * Turns a selected set of lights off
     * @param ids array of integer light key's
     */
    lightOff(ids) {
        fetch(`${BASE_URL}/lights/action/off`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ids})
        })
    },

    /**
     * Turns all lights off regardless of what
     * is selected
     */
    off() {
        fetch(`${BASE_URL}/off`)
            .then((response) => response.json())
            .then((responseJson) => {
                //Do something with response
            }).catch((error) => {
            console.error(error);
        });
    },

    /**
     * Turns a fixed set of lights a specific color
     * @param color Hex color code
     * @param ids Array integer array of light ids
     */
    setLightColor(color, ids) {
        fetch(`${BASE_URL}/lights/action/color`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ids, color})
        })
    },

    /**
     * Turns all lights a specific color
     * @param color Hex color code
     */
    setColor(color) {
        fetch(`${BASE_URL}/color/${color}`)
            .then((response) => response.json())
            .then((responseJson) => {
                //Do something with response
            }).catch((error) => {
            console.error(error);
        });
    },


    /**
     * Sets the brightness of the selected lights
     * @param ids
     * @param value
     * @param callback
     */
    setBrightness(id, value, callback) {
        fetch(`${BASE_URL}/lights/action/brightness`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bri: value,
                ids: id
            })
        }).then((res) => res.json()).then(json => callback(json))
    }

};