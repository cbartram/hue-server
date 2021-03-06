/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import '../css/LoginPrompt.css';
import RaisedButton from 'material-ui/RaisedButton';
import { Link } from 'react-router-dom';



export default class SetupPrompt extends Component {
    constructor() {
        super();

        this.state = {
            expanded: true,
            redirect: false,
        };
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="background">
                            <div className="row">
                                <div className="col-md-6 col-md-offset-3">
                                    <h3 className="header-text">Lets get you setup!</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-2 col-md-offset-5">
                                    <Link to="/setup"><RaisedButton label="Setup Lights" primary={true} className="button-primary" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-6 col-md-offset-3">
                                <h3 className="header-text">Or</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-2 col-md-offset-5">
                                <Link to="/profile"><RaisedButton label="Profile" secondary={true} className="button-primary" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}