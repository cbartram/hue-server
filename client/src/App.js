import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import _ from 'lodash';
import {Card, CardHeader, CardText, CardActions} from "material-ui/Card";
import {CirclePicker} from 'react-color';


//Material UI
import RaisedButton from 'material-ui/RaisedButton';

//Custom Components
import LightList from './components/LightList';

class App extends Component {
  constructor() {
      super();

      this.state = {
        lights: [], //Array of Light Objects
         foo:'bar',
         color: null, //Current color selected by the color picker
      }
  }

  componentDidMount = () => {

    //Find Lights
    this.getNames();

  };

  flash = () => {
        this.setState({foo: 'barr'});
  };

  getNames = () => {
    let result = this.state.lights;

     fetch('http://hue-server.ddns.net:3000/lights') //TODO change from localhost:3000/lights to http://hue-server.ddns.net:3000/lights
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

        //Wrong light id is being passed....
        console.log(id);

        let lights = this.state.lights;

        const index = _.findIndex(lights, (o) => {
           return o.id = id;
        });

        console.log(index);


        //Check or unCheck the lights
        lights[index].selected = !lights[index].selected;

        console.log(lights[index]);

        this.setState({ lights });
    };

    /**
     * Handles Color picker being changed
     *
     */
    handleColorChange = (color) => {
      this.setState({color});
    };

    on = () => {

    };

    off = () => {

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
         </div>
      </div>
    );
  }
}

export default App;
