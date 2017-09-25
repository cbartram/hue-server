/**
 * Created by christianbartram on 9/17/17.
 */
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import {Card, CardHeader, CardText } from 'material-ui/Card';
import style from './style.css';
import RaisedButton from 'material-ui/RaisedButton';
import {withRouter} from 'react-router-dom';

export default class Profile extends Component {
    constructor() {
        super();

        this.state = {
            user: JSON.parse(sessionStorage.getItem('user')),
        }
    }

    componentDidMount = () => {

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
                            </CardText>
                        </Card>
                    </div>
                    <div className="col-md-3 col-md-offset-1">
                        <Card>
                            <CardHeader
                                title="Actions"
                                subtitle="Your Profile"
                            />
                            <CardText>
                                <div className="row">
                                    <div className="col-md-3">
                                       <Button/>
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