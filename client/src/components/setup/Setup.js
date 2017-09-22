/**
 * Created by g6vc on 9/20/17.
 */
import React, {Component} from 'react';
import {
    Step,
    Stepper,
    StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import AppBar from 'material-ui/AppBar';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import {Redirect} from 'react-router-dom';
import _ from 'lodash';



export default class Setup extends Component {
    constructor() {
        super();

        this.state = {
            finished: false,
            stepIndex: 0,
            devices: [], //All devices found from the network scan
            bridge: {username: 'cbartram', key: 'foo', ip:'10.0.0.20', primary: true}, //The user selected philips hue bridge
            errorMessage: '',
            successfulPersist: false, //Whether to display circular progress or success message
        };
    }

    componentWillMount = () => {
        //Make a request for the server to scan the wifi
        fetch('/api/v1/scan')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({devices: responseJson.devices});
            })
            .catch((error) => {
                console.error(error);
            });
    };

    handleNext = () => {
        const {stepIndex} = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 3,
        });
    };

    handleBridgeSelection = (device) => {
        let {devices} = this.state;

        let index =  _.findIndex(devices, o => {
            return o.ip === device.ip;
        });

        devices.forEach((d, v) => {
            d.primary = v === index;
        });

        this.setState({devices, bridge: devices[index]});
    };

    /**
     * Handles Pinging the Hue API for a new api key
     */
    handleLink = () => {
        //Get API Key from Philips Hue
        fetch('api/v1/key/generate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                devicetype: this.state.bridge.ip
            })
        }).then(data => data.json()).then(key => {
            if(key[0].error) {
                this.setState({errorMessage: 'Oh no, we couldnt authenticate you! Ensure that you have selected the right Hue bridge in step one and have pressed the link button on the top of the bridge.'})
            } else {
                //It was successful WOO!

                let user = JSON.parse(sessionStorage.getItem('user'));

                let {bridge} = this.state;
                Object.assign(bridge, {key: key[0].success.username}, {username: user.username});
                console.log(bridge);
                this.setState({bridge});
            }
        });
    };


    /**
     * Handles persisting queried information to DB
     */
    persist = () => {
        if(!this.state.successfulPersist) {
            fetch('api/v1/key/update', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: this.state.bridge
                })
            }).then(data => data.json()).then(res => {
                if (res.success) {
                    //Remove current user from sessionStorage and set the new user (with updated key & ip)
                    sessionStorage.removeItem('user');
                    sessionStorage.setItem('user', JSON.stringify(res.user));
                    this.setState({successfulPersist: true});
                }
            });
        }
    };

    getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <div>
                        <h4>We Found <span style={{color:'rgb(0, 212, 114'}}>{this.state.devices.length}</span> Philips Hue Bridge(s)</h4>
                        <p>Check on the bottom of your Philips Hue bridge next to the HomeKit code for six alphanumeric
                        characters which match the characters listed below. Then click the button below with your matching
                        alphanumeric characters to confirm your bridge with this App!</p>
                        <div className="row">
                            {
                                this.state.devices.map(device => {
                                    return (
                                        <div key={device.ip} className="col-md-3">
                                            <RaisedButton primary={device.primary} label={device.mac.substring(8, device.mac.length)} onClick={() => {this.handleBridgeSelection(device)}} />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <p>Press the Link button on the top of your Hue Bridge then within 30 seconds press the Link button below to establish a connection
                        between your Hue Bridge and this Application</p>
                        <p style={{color:'red'}}><strong>{this.state.errorMessage}</strong></p>
                        <RaisedButton primary={true} label="Link" onClick={() => {this.handleLink()}}/>
                    </div>
                );
            case 2:
                this.persist();
                return (
                    <div className="row">
                        <div className="col-md-10 col-md-offset-2">
                            <h3>Updating your Account, Hang tight!</h3>
                        </div>
                        <div className="row">
                            <div className="col-md-9 col-md-offset-2">
                                {
                                    this.state.successfulPersist === false ?
                                        <CircularProgress size={60} thickness={7} /> :
                                        <p style={{color: 'rgb(0, 202, 114)'}}><strong>Your information has been saved successfully!</strong> <FontIcon className="fa fa-check" style={{color:'rgb(0,202,114)',fontSize:20}} /></p>
                                }
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return <h3>Your Hue has been setup successfully! <FontIcon className="fa fa-check" style={{color:'rgb(0,202,114)',fontSize:25}} /></h3>;
            default:
                return null
        }
    }

    render() {
        const {finished, stepIndex} = this.state;
        const contentStyle = {margin: '0 16px'};

        return(
            <div>
                <AppBar/>
                <div className="container">
                    <div className="row">
                        <div className="col-md-10 col-md-offset-2">
                            <Card style={{marginTop:20}}>
                                <CardHeader
                                    title="Setup your Hue Bridge"
                                    subtitle="Link Account"
                                />
                                <CardText>
                                    <Stepper activeStep={stepIndex}>
                                        <Step>
                                            <StepLabel>Select your Hue Bridge</StepLabel>
                                        </Step>
                                        <Step>
                                            <StepLabel>Verify Physical Access</StepLabel>
                                        </Step>
                                        <Step>
                                            <StepLabel>Link to your Account</StepLabel>
                                        </Step>
                                        <Step>
                                            <StepLabel>Done</StepLabel>
                                        </Step>
                                    </Stepper>
                                    <div style={contentStyle}>
                                        {finished ? (
                                            <Redirect to="/" />
                                        ) : (
                                            <div>
                                                <p>{this.getStepContent(stepIndex)}</p>
                                                <div style={{marginTop: 12}}>
                                                    <RaisedButton
                                                        label={stepIndex === 3 ? 'Finish' : 'Next'}
                                                        primary={true}
                                                        onClick={this.handleNext}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardText>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}