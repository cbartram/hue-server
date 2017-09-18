/**
 * Created by christianbartram on 9/17/17.
 */
import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import User from '../../../schema/Users';

export default class Signup extends Component {
    constructor() {
        super();

        this.state = {
            username: ''
        }
    }

    handleChange = (e, value) => {
        this.setState({username: value});
    };

    handleClick = () => {
        let user = new User();

        if(this.state.username.length > 0) {
            user.username = this.state.username;
            user.id = Math.floor((Math.random() * 8));

            user.save((err) => {});
        }
    };


    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-4 col-md-offset-3">
                        <TextField
                            hintText="Enter Username"
                            floatingLabelText="Username"
                            floatingLabelFixed={true}
                            onChange={(e, value) => this.handleChange(e, value)}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4 col-md-offset-3">
                        <RaisedButton label="Submit" onClick={this.handleClick} />
                    </div>
                </div>
            </div>
        );
    }
}