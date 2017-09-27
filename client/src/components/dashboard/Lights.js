/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import Divider from "material-ui/Divider";
import {ListItem, List} from "material-ui/List";
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';

export default class LightList extends Component {
    constructor() {
        super();

        this.state = {
            hasLights: true,
        }
    }


    componentDidMount = () => {
      this.props.lights.length === 0 && this.setState({hasLights: false});
    };

    render() {

        if(this.state.hasLights) {
            return (
                <div>
                    <List>
                        {
                            this.props.lights.map((light, key) => {
                                return <ListItem
                                    key={key}
                                    leftCheckbox={<Checkbox checked={light.state.selected}
                                                            onCheck={(e, checked, id) => this.props.handleCheck(e, checked, light.id)}/>}
                                    primaryText={light.name}
                                    secondaryText="Select Light"
                                />
                            })
                        }
                    </List>
                </div>
            )
        } else {
            return (
                <div>
                    <List>
                        <p>No lights found on the network!</p>
                    </List>
                </div>
            )
        }
    }

}