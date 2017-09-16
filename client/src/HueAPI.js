/**
 * Created by christianbartram on 9/13/17.
 */
module.exports = {
  on() {
      fetch('http://hue-server.ddns.net:3000/lights/on') //TODO change from localhost:3000/lights to http://hue-server.ddns.net:3000/lights
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  },

  off() {
      fetch('http://hue-server.ddns.net:3000/lights/off') //TODO change from localhost:3000/lights to http://hue-server.ddns.net:3000/lights
          .then((response) => response.json())
          .then((responseJson) => {
              //Do something with response
          }).catch((error) => {
          console.error(error);
      });
  }

};