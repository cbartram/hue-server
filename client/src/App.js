import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import _ from 'lodash';
import { CirclePicker } from 'react-color';

//Material UI
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardText, CardHeader} from "material-ui/Card";
import Slider from 'material-ui/Slider';

//Custom Components
import LightList from './components/dashboard/LightList';
import hueAPI from './HueAPI';
import LoginPrompt from './components/LoginPrompt';
import SetupPrompt from './components/SetupPrompt';


class App extends Component {
  constructor() {
      super();

      this.state = {
         lights: [], //Array of Light Objects
         brightness: 100, //Value for the Slider's brightness
         color: null, //Current color selected by the color picker (an object of colors)
         user: null,
         isLoggedIn: false,
         setupRequired: false,
      }
  }

  componentDidMount = () => {

    //TODO Set base URL to Production environment
     hueAPI.setURL('http://localhost:3000');

    //Fetch Lights
    this.getLights();

    //Check user login status & if they need to go through the setup process
    sessionStorage.getItem('user') !== null && this.setState({isLoggedIn: true, user: JSON.parse(sessionStorage.getItem('user'))});

   if(sessionStorage.getItem('user') !== null) {
       let user = JSON.parse(sessionStorage.getItem('user'));

       if(user.setupRequired) {
           this.setState({setupRequired: true});
           //TODO change setup status in DB to false
       }
   }

  };

  flash = () => {

  };

  getLights = () => {
    let result = this.state.lights;

     fetch('/lights')
          .then((response) => response.json())
          .then((responseJson) => {
              for (let key in responseJson) {
                  if (responseJson.hasOwnProperty(key)) {

                      let obj = {
                          key: key,
                          name: responseJson[key].name,
                          id: responseJson[key].uniqueid,
                          state: {
                              on: responseJson[key].state.on,
                              selected: true,
                              reachable: responseJson[key].state.reachable,
                              hue: responseJson[key].state.hue,
                              sat: responseJson[key].state.sat,
                              bri: responseJson[key].state.bri
                          }
                      };

                      result.push(obj);
                  }
              }
          }).catch((error) => {
              console.error(error);
          });

     this.setState({lights: result });

  };

    /**
     * Handles Light List Checkboxes being checked
     *
     */
    handleCheck = (e, checked, id) => {
        let { lights } = this.state;

        if(typeof id !== 'undefined' && id !== null) {

            let index = _.findIndex(lights, (o) => {
                return o.id === id;
            });

            //Check or unCheck the lights
            lights[index].state.selected = !lights[index].state.selected;

            this.setState({lights});

        }
    };

    /**
     * Handles Color picker being changed
     * @param color String hex color (including the #)
     */
    handleColorChange = (color) => {
      this.setState({color}, () => {
          //Strip hash sign away from color
          color = color.hex.substr(1, color.length);
          hueAPI.setColor(color);
      });
    };

    /**
     * Turns all the lights on
     */
    on = () => {
        hueAPI.on();
    };

    /**
     * Turns all Lights off
     */
    off = () => {
        hueAPI.off();
    };

    /**
     * Set the brightness for each light
     * @param e Event event object e
     * @param value int value between [0, 254]
     */
    handleBrightness = (e, value) => {
        this.state.lights.forEach(light => {
            hueAPI.setBrightness(light.key, value);
        });

        this.setState({ brightness: value });
    };


    render() {
    return (
          <div className="App">
             <div className="container-fluid">
                 <div className="row">
                 <div className="col-md-12">
                     <div className="App-header">
                         <h2>Smart Lighting Control</h2>
                         <p className="App-intro">
                             Check out some controls below
                         </p>
                     </div>
                 </div>

                 {!this.state.isLoggedIn ? <LoginPrompt/> : null}
                 {this.state.setupRequired ? <SetupPrompt/> : null}

                 {/* Houses the List of Lights */}
                 <div className="col-md-5 col-md-offset-1 light-list">
                    <LightList handleCheck={(e, checked, id) => this.handleCheck(e, checked, id) } lights={this.state.lights}/>
                 </div>
                     <div className="col-md-5 light-list">
                         <Card>
                             <CardText>
                                <CirclePicker onChangeComplete={this.handleColorChange} />
                                 <div className="row padding-top">
                                     <div className="col-md-3">
                                         <RaisedButton label="Flash" onClick={this.flash} />
                                     </div>
                                     <div className="col-md-3">
                                         <RaisedButton label="On" onClick={this.on} />
                                     </div>
                                     <div className="col-md-3">
                                         <RaisedButton label="Off" onClick={this.off}/>
                                     </div>
                                 </div>
                             </CardText>
                         </Card>
                     </div>
                 </div>
                 {/* Card for Brightness */}
                 <div className="row">
                     <div className="col-md-5 col-md-offset-6 light-list">
                         <Card>
                             <CardHeader
                                 style={{float:'left'}}
                                 title="Brightness"
                             />
                             <CardText>
                                 <Slider
                                     min={0}
                                     max={254}
                                     step={1}
                                     value={this.state.brightness}
                                     onChange={this.handleBrightness}
                                 />
                             </CardText>
                         </Card>
                     </div>
                 </div>
             </div>
          </div>
    );
  }
}

export default App;
