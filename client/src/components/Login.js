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

    handleChange = (e, value) => {
        this.setState({username: value});
    };

    handlePasswordChange = (value) => {
        this.setState({password: value});
    };

    handleClick = () => {
        //Post data to server
        fetch('http://localhost:3000/login', { //todo change to hue-server:3000/signup
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
                sessionStorage.setItem('user', json.user);
                this.setState({redirect: true});
            }
        })
    };


    render() {
        return (
            <div className="container-fluid">
                <AppBar
                    title="Login"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                />
                <div className="row">
                    <div className="col-md-4 col-md-offset-5">
                        <h3>Login</h3>
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
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4 col-md-offset-6" style={{marginTop:'20px'}}>
                        <RaisedButton label="Submit" onClick={this.handleClick} />
                    </div>
                </div>
                { this.state.redirect === false ? null : <Redirect to="/" /> }
            </div>
        );
    }
}