/**
 * Created by christianbartram on 9/17/17.
 */
import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Redirect} from 'react-router-dom';

export default class Login extends Component {
    constructor() {
        super();

        this.state = {
            username: '',
            password: '',
            redirect: false, //Determines if we should redirect after successful signup
            errorText: null,
        }
    }

    componentDidMount = () => {
      //If a user is already logged in redirect them back
      sessionStorage.getItem('user') !== null && this.setState({redirect: true});
    };

    handleChange = (e, value) => {
        this.setState({username: value});
    };

    handlePasswordChange = (value) => {
        this.setState({password: value});
    };

    handleClick = () => {
        //Post data to server
        fetch('/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            })
        }).then(res => res.json()).then((json) => {
            //Something went wrong
            if(!json.success) {
                this.setState({errorText: json.msg});
            } else {
                sessionStorage.setItem('user', JSON.stringify(json.user));
                this.setState({redirect: true});
            }
        })
    };

    render() {
        return (
            <div className="container-fluid">
                <AppBar
                    title="Login"
                />
                <div className="row">
                    <div className="col-md-4 col-lg-3 col-md-offset-5">
                        <div className="row">
                            <div className="col-md-4 col-lg-4 col-lg-offset-3 col-md-offset-6" style={{marginTop:'20px'}}>
                                <h3>Login</h3>
                            </div>
                        </div>
                        <TextField
                            hintText="Username"
                            floatingLabelText="Username"
                            errorText={this.state.errorText}
                            floatingLabelFixed={false}
                            onChange={(e, value) => this.handleChange(e, value)}
                        />
                        <TextField
                            hintText="Password"
                            floatingLabelText="Password"
                            errorText={this.state.errorText}
                            type="password"
                            onChange={(e, value) => this.handlePasswordChange(value)}
                        />
                        <div className="row">
                            <div className="col-md-4 col-lg-4 col-lg-offset-3 col-md-offset-6" style={{marginTop:'20px'}}>
                                <RaisedButton label="Submit" onClick={this.handleClick} />
                            </div>
                        </div>
                    </div>
                </div>
                { this.state.redirect === false ? null : <Redirect to="/" /> }
            </div>
        );
    }
}