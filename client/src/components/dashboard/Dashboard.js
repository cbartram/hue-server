import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/App.css';
import _ from 'lodash';
import { ChromePicker } from 'react-color';
import {Link} from 'react-router-dom';

import Data from '../../data.json';

//Material UI
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardText, CardHeader} from "material-ui/Card";
import Slider from 'material-ui/Slider';

//Custom Components
import LightList from '../../components/dashboard/LightList';
import hueAPI from '../../HueAPI';
import LoginPrompt from '../../components/LoginPrompt';
import SetupPrompt from '../../components/SetupPrompt';


class App extends Component {
    constructor() {
        super();

        this.state = {
            lights: [], //Array of Light Objects
            brightness: 100, //Value for the Slider's brightness
            color: '#FFFFFF', //Current color selected by the color picker (an object of colors)
            user: null,
            isColorLooping: false,
            isLoggedIn: false,
            setupRequired: false,
        }
    }

    componentDidMount = () => {

        //TODO Set base URL to Production environment
        hueAPI.setURL('http://localhost:3000');


        //Check user login status & if they need to go through the setup process
        sessionStorage.getItem('user') !== null && this.setState({isLoggedIn: true, user: JSON.parse(sessionStorage.getItem('user'))});

        if(sessionStorage.getItem('user') !== null) {
            let user = JSON.parse(sessionStorage.getItem('user'));

            if(user.setupRequired) {
                this.setState({setupRequired: true});
            } else {
                //User is logged in and does not require setup
                //we can be sure the HueAPI on the server has valid values
                this.getLights(user);
            }
        }

    };

    flash = () => {
        hueAPI.flash(this.state.lights, (res) => {
           console.log(res);
        });
    };

    getLights = (user) => {
        let result = this.state.lights;

        hueAPI.getLights(user, (responseJson) => {
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
            this.setState({lights: result });
        });


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

    handleColorLoop = () => {
      if(this.state.isColorLooping) {
          //cancel color Loop
          hueAPI.cancelColorLoop(this.state.lights.filter(o => o.state.selected === true).map(c => c.key), (res) => {});
      } else {
          hueAPI.colorLoop(this.state.lights.filter(o => o.state.selected === true).map(c => c.key), (res) => {})
      }

      this.setState((state) => ({isColorLooping : !state.isColorLooping}) );
    };

    /**
     * Handles Color picker being changed
     * @param color String hex color (including the #)
     */
    handleColorChange = (color) => {
        this.setState({color}, () => {
            //Strip hash sign away from color
            color = color.hex.substr(1, color.length);

            //From Light state filter for only ids where light is active
            const ids = this.state.lights.filter(o => o.state.selected === true).map(c => c.key);
            hueAPI.setLightColor(color, ids);
        });
    };

    /**
     * Set the brightness for each light
     * @param e Event event object e
     * @param value int value between [0, 254]
     */
    handleBrightness = (e, value) => {

        const ids = this.state.lights.filter(o => o.state.selected === true).map(c => parseInt(c.key));
        hueAPI.setBrightness(ids, value, (res) => {});

        this.setState({ brightness: value });
    };


    render() {
        //Returns the Dashboard components if the user is logged in.
        const dashboard = () => {
            return (
                <div>
                   <div className="row">
                    {/* Houses the List of Lights */}
                    <div className="col-md-3 col-md-offset-1 light-list">
                        <LightList handleCheck={(e, checked, id) => this.handleCheck(e, checked, id) } lights={this.state.lights}/>
                    </div>
                    <div className="col-md-5 light-list">
                        <Card>
                            <CardText>
                                <div className="row padding-top">
                                    <div className="col-md-6">
                                        <ChromePicker disableAlpha color={this.state.color} onChangeComplete={(color) => this.handleColorChange(color)} />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <RaisedButton label="Off" onClick={() => hueAPI.lightOff(this.state.lights.filter(o => o.state.selected === true).map(c => c.key), (res) => {
                                                    if(res.type === 'hue_init_fail') {
                                                        console.log("Hue failed to initialize");
                                                    }
                                                })}/>
                                            </div>
                                            <div className="col-md-8">
                                                <RaisedButton label="On" onClick={() => hueAPI.lightOn(this.state.lights.filter(o => o.state.selected === true).map(c => c.key), (res) => {
                                                    if(res.type === 'hue_init_fail') {
                                                        console.log("Hue failed to initialize");
                                                    }}
                                                 )} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4 padding-top">
                                                <RaisedButton label="Flash" onClick={this.flash} />
                                            </div>
                                            <div className="col-md-8 padding-top">
                                                <RaisedButton label={this.state.isColorLooping ? "Cancel Loop" : "Color Loop"} onClick={this.handleColorLoop}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardText>
                        </Card>
                    </div>
                   </div>
                    {/* Card for Brightness */}
                    <div className="row">
                        <div className="col-md-3 col-md-offset-1">
                            <Card>
                                <CardHeader
                                    style={{float:'left'}}
                                    title="Profile"
                                />
                                <CardText>
                                    <div className="row" style={{clear:'left'}}>
                                        <div className="col-md-2">
                                            <Link to="/profile">
                                                <RaisedButton label="Profile" primary={true} />
                                            </Link>
                                        </div>
                                    </div>
                                </CardText>
                            </Card>
                        </div>

                        <div className="col-md-3 light-list">
                            <Card>
                                <CardHeader
                                    style={{float:'left'}}
                                    title={`Brightness - ${this.state.brightness}%`}
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
            )
        };

        return (
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
                        {!this.state.isLoggedIn && <LoginPrompt/> }
                        {(this.state.isLoggedIn && this.state.setupRequired) && <SetupPrompt/>}
                        {(this.state.isLoggedIn && !this.state.setupRequired) && dashboard()}
                    </div>
                </div>
        );
    }
}

export default App;
