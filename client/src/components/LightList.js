/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import {Card, CardHeader, CardText, CardActions} from "material-ui/Card";
import FlatButton from 'material-ui/FlatButton';
import Lights from './Lights';


export default class LightList extends Component {
    constructor() {
        super();

        this.state = {
            expanded: true,
        };
    }

    componentDidMount = () => {

    };

    render() {
        return (
            <Card>
                <CardHeader
                    title="Lights"
                    subtitle="Current Lights"
                    actAsExpander={true}
                    showExpandableButton={true}
                />
                <CardText>
                    <Lights handleCheck={(e, checked, id) => this.props.handleCheck(e, checked, id)} lights={this.props.lights} />
                </CardText>
            </Card>
        );
    }

}