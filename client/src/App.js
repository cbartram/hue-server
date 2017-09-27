import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import Dashboard from './components/dashboard/Dashboard';



export default class App extends Component {
  render() {
    return (
          <div className="App">
            <Dashboard/>
          </div>
    );
  }
}