/**
 * Created by christianbartram on 9/17/17.
 */
import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import {Redirect} from 'react-router-dom';
import IconButton from 'material-ui/IconButton';

export default class Signup extends Component {
    constructor() {
        super();

        this.state = {
            username: '',
            password: '',
            redirect: false //Determines if we should redirect after successful signup
        }
    }

    componentDidMount = () => {
      sessionStorage.getItem('user') !== null && this.setState({ redirect: true });
    };

    handleChange = (e, value) => {
        this.setState({username: value});
    };

    handlePasswordChange = (value) => {
      this.setState({password: value});
    };

    handleClick = () => {
        //Post data to server
        fetch('/signup', {
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
            if(json.success) {
                //Log them in as well
                sessionStorage.setItem('user', JSON.stringify(json.user));
                this.setState({redirect: true})
            }
        })
    };

    handleBackClick = () => {
        console.log('Clicked');
        this.setState({redirect: true});
    };

    render() {
        return (
            <div className="container-fluid">
                <AppBar
                    title="Signup"
                    iconClassNameLeft={<IconButton onClick={this.handleBackClick} />}
                />
                <div className="row">
                    <div className="col-md-4 col-md-offset-5">
                        <h3>Sign-up</h3>
                        <TextField
                            hintText="Enter Username"
                            floatingLabelText="Username"
                            floatingLabelFixed={false}
                            onChange={(e, value) => this.handleChange(e, value)}
                        />
                        <TextField
                            hintText="Password"
                            floatingLabelText="Password"
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
                {
                    this.state.redirect === false ? null : <Redirect to="/" />
                }
            </div>
        );
    }
}