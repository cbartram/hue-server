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
import FlatButton from 'material-ui/FlatButton';



export default class Setup extends Component {
    constructor() {
        super();

        this.state = {
            finished: false,
            stepIndex: 0,
        };
    }

    handleNext = () => {
        const {stepIndex} = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 2,
        });
    };

    handlePrev = () => {
        const {stepIndex} = this.state;
        if (stepIndex > 0) {
            this.setState({stepIndex: stepIndex - 1});
        }
    };

    getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <div>
                        <RaisedButton label="food"/>
                    </div>
                );
            case 1:
                return 'Press the Link button on the top of your hue bridge';
            case 2:
                return 'Updating your account!';
            default:
                return null
        }
    }

    render() {

        const {finished, stepIndex} = this.state;
        const contentStyle = {margin: '0 16px'};

        return(
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 col-md-offset-2">
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
                            </Stepper>
                            <div style={contentStyle}>
                                {finished ? (
                                    <p>
                                        <a href="#" onClick={(event) => {event.preventDefault(); this.setState({stepIndex: 0, finished: false});}}>
                                            Click here
                                        </a> to reset the example.
                                    </p>
                                ) : (
                                    <div>
                                        <p>{this.getStepContent(stepIndex)}</p>
                                        <div style={{marginTop: 12}}>
                                            <FlatButton
                                                label="Back"
                                                disabled={stepIndex === 0}
                                                onClick={this.handlePrev}
                                                style={{marginRight: 12}}
                                            />
                                            <RaisedButton
                                                label={stepIndex === 2 ? 'Finish' : 'Next'}
                                                primary={true}
                                                onClick={this.handleNext}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}