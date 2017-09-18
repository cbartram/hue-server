/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import '../css/LoginPrompt.css';
import RaisedButton from 'material-ui/RaisedButton';
import { Link } from 'react-router-dom';



export default class LoginPrompt extends Component {
    constructor() {
        super();

        this.state = {
            expanded: true,
        };
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="background">
                            <div className="row">
                                <div className="col-md-4 col-md-offset-4">
                                    <h3 className="header-text">Login to Add Lights.</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-2 col-md-offset-4">
                                    <Link to="/signup"><RaisedButton label="Sign-Up" primary={true} className="button-primary" /></Link>
                                </div>
                                <div className="col-md-2 ">
                                    <Link to="/login"><RaisedButton label="Login" primary={true} className="button-primary" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}