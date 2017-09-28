/**
 * Created by christianbartram on 9/17/17.
 */
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardHeader, CardText } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import './style.css';
import RaisedButton from 'material-ui/RaisedButton';
import {withRouter, Link} from 'react-router-dom';

export default class Profile extends Component {
    constructor() {
        super();

        this.state = {
            user: JSON.parse(sessionStorage.getItem('user')),
            showUnlink: false, //Wether or not to show the unlink button
            errorMessage: {currPass: '', newPass: '', confirm: ''},
            currPass: '',
            newPass: '',
            confirm: '',
            successMessage: '',
        }
    }


    componentDidMount = () => {
      //Show the unlink button if the user is setup
      if(!this.state.user.setupRequired) {
          this.setState({showUnlink: true});
      }
    };

    /**
     * Handles the current password field being changed
     * @param e
     * @param value
     * @param field String the name of the field we are referring too
     */
    handleChange = (e, value, field) => {
      switch(field) {
          case "curr":
              this.setState({currPass:value});
              break;
          case "new":
              this.setState({newPass: value});
              break;
          case "confirm":
              this.setState({confirm: value});
              break;
          default:
              break;
      }
    };

    /**
     * Handles Submitting the form to the server
     */
    handleSubmit = () => {
      //Data is stored in the state;
      let { currPass, newPass, confirm } = this.state;
      let valid = false;

      if(currPass.length > 1) {
          valid = true;
      } else {
          this.setState({errorMessage: {newPass: '', currPass: 'Your passwords must not be blank', confirm: ''}});
      }

      //Ensure newpass and confirm match
       if(newPass === confirm && valid) {
           //Post data to server
           fetch('/password/update', {
               method: 'POST',
               headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   curr: currPass,
                   newPass: newPass,
                   username: this.state.user
               })
           }).then(res => res.json()).then((json) => {
               //Something went wrong with their original password being wrong
               if (!json.success) {
                   this.setState({errorMessage: {newPass: '', currPass: json.msg, confirm: ''}});
               } else {
                   sessionStorage.setItem('user', JSON.stringify(json.user));

                   //Disable any Error Messages and
                   //Alert the user their password has been updated
                   this.setState({errorMessage: {newPass: '', currPass: '', confirm: ''}, successMessage: 'Your password has been updated successfully!'});

               }
           });

       } else {
           //Something went wrong with the passwords matching
           this.setState({errorMessage: {newPass: 'New passwords do not match', currPass: '', confirm: 'New passwords do not match'}});
       }
    };

    /**
     * Handles removing the api key, and ip from the user account
     */
    handleUnlink = () => {
        //Unlink the users account
        fetch('/unlink', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.state.user
            })
        }).then(res => res.json()).then((json) => {
            if(json.success) {
                sessionStorage.removeItem('user');
                sessionStorage.setItem('user', JSON.stringify(json.user));
                this.setState({showUnlink: false});
            }
        });
    };


    render() {
        const Button = withRouter(({history}) => (
            <RaisedButton
                label="Logout"
                primary={true}
                onClick={() => {
                    sessionStorage.removeItem('user');
                    history.push('/');
                }}
            />
        ));

        return (
            <div className="container-fluid">
                <AppBar/>
                <div className="row">
                    <div className="col-md-6 col-md-offset-1 card-padding">
                        <Card>
                            <CardHeader
                                title={this.state.user.username}
                                subtitle="Your Profile"
                                avatar="images/default.jpg"
                            />
                            <CardText>
                                <div className="row">
                                    <div className="col-md-3 padding-top">
                                       API Key
                                    </div>
                                    <div className="col-md-9">
                                        <div className="highlight">
                                            {this.state.user.key}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-3 padding-top">
                                        Bridge IP
                                    </div>
                                    <div className="col-md-4">
                                        <div className="highlight">
                                            {this.state.user.ip}
                                        </div>
                                    </div>
                                </div>
                                <div className="row padding-top">
                                    <div className="col-md-2 col-md-offset-3">
                                        <Link to="/">
                                            <RaisedButton label="Dashboard" />
                                        </Link>
                                    </div>
                                </div>
                            </CardText>
                        </Card>
                    </div>
                    <div className="col-md-3 padding-top">
                        <Card>
                            <CardHeader
                                title="Actions"
                                subtitle="Your Profile"
                            />
                            <CardText>
                                <div className="row">
                                    <div className="col-md-3">
                                        <h4>Logout</h4>
                                       <Button/>
                                    </div>
                                </div>
                            </CardText>
                            <CardText>
                                <h4>Change your Password</h4>
                                <div className="success">
                                    {this.state.successMessage}
                                </div>
                                <TextField
                                    hintText="Current Password"
                                    type="password"
                                    floatingLabelText="Current Password"
                                    errorText={this.state.errorMessage.currPass}
                                    floatingLabelFixed={false}
                                    onChange={(e, value) => this.handleChange(e, value, "curr")}
                                />
                                <TextField
                                    hintText="New Password"
                                    type="password"
                                    floatingLabelText="New Password"
                                    errorText={this.state.errorMessage.newPass}
                                    floatingLabelFixed={false}
                                    onChange={(e, value) => this.handleChange(e, value, "new")}
                                />
                                <TextField
                                    hintText="Confirm Password"
                                    type="password"
                                    floatingLabelText="Confirm Password"
                                    errorText={this.state.errorMessage.confirm}
                                    floatingLabelFixed={false}
                                    onChange={(e, value) => this.handleChange(e, value, "confirm")}
                                />
                                <RaisedButton label="Submit" onClick={this.handleSubmit} />

                                <div className="row">
                                    <div className="col-md-10">
                                        {
                                            this.state.showUnlink === true ?
                                                <div>
                                                    <h4>Danger Zone</h4>
                                                    <RaisedButton secondary={true} label="Unlink Account" onClick={this.handleUnlink} />
                                                </div>
                                            : <div>
                                                <h4>Setup Account</h4>
                                                <Link to="/setup"><RaisedButton primary={true} label="Setup" /></Link>
                                            </div>
                                        }

                                    </div>
                                </div>
                            </CardText>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}