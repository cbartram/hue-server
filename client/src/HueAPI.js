/**
 * Created by christianbartram on 9/13/17.
 */
let BASE_URL = "http://hue-server.ddns.net:3000";


module.exports = {

  setURL(url) {
      BASE_URL = url;
  },

  getURL() {
      return BASE_URL;
  },

  on() {
      fetch(`${BASE_URL}/on`) //TODO change from localhost:3000/lights to http://hue-server.ddns.net:3000/lights
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  },

  off() {
      fetch(`${BASE_URL}/off`) //TODO change from localhost:3000/lights to http://hue-server.ddns.net:3000/lights
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  },

  setColor(color) {
      fetch(`${BASE_URL}/color/${color}`) //TODO change from localhost:3000/lights to http://hue-server.ddns.net:3000/lights
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