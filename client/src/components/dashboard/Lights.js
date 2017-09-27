/**
 * Created by christianbartram on 9/13/17.
 */
import React, {Component} from 'react';
import {ListItem, List} from "material-ui/List";
import Checkbox from 'material-ui/Checkbox';

export default class LightList extends Component {
    constructor() {
        super();

        this.state = {}
    }

    render() {
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
    }

}