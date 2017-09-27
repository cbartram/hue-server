/**
 * Created by christianbartram on 9/13/17.
 */
let BASE_URL = "http://localhost:3000";


module.exports = {

  setURL(url) {
      BASE_URL = url;
  },

  getURL() {
      return BASE_URL;
  },

  getLights(user, callback) {
      fetch(`${BASE_URL}/lights?key=${user.key}&ip=${user.ip}`)
          .then((response) => response.json())
          .then((responseJson) => {
              callback(responseJson);
          }).catch((error) => {
          console.error(error);
      });
  },

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

  on() {
      fetch(`${BASE_URL}/on`)
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  },

  off() {
      fetch(`${BASE_URL}/off`)
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  },

  setColor(color) {
      fetch(`${BASE_URL}/color/${color}`)
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  },


  setBrightness(id, value) {
      fetch(`${BASE_URL}/lights/${id}/brightness`, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              bri: value,
          })
      })
  }

};