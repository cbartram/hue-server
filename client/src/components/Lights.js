/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import Divider from "material-ui/Divider";
import {ListItem, List} from "material-ui/List";
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';

export default class LightList extends Component {
    render() {
        return (
            <div>
                <Divider />
                <List>
                    {
                        this.props.lights.map((light, key) => {
                            return <ListItem
                                key={key}
                                leftCheckbox={<Checkbox checked={light.state.selected} onCheck={(e, checked, id) => this.props.handleCheck(e, checked, light.id)} />}
                                primaryText={light.name}
                                secondaryText="Select Light"
                            />
                        })
                    }
                </List>
            </div>
        );
    }

}