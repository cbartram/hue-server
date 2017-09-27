/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import {Card, CardHeader, CardText} from "material-ui/Card";
import Lights from './Lights';


export default class LightList extends Component {
    constructor() {
        super();

        this.state = {
            expanded: true,
        };
    }

    render() {
        return (
            <Card>
                <CardHeader title="Lights" />
                <CardText>
                    <Lights handleCheck={(e, checked, id) => this.props.handleCheck(e, checked, id)} lights={this.props.lights} />
                </CardText>
            </Card>
        );
    }

}