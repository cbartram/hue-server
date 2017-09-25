import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.css';
import Dashboard from './components/dashboard/Dashboard';

//Custom Components
import hueAPI from './HueAPI';



class App extends Component {
  constructor() {
      super();

      this.state = {

      }
  }

  render() {
    return (
          <div className="App">
            <Dashboard/>
          </div>
    );
  }
}

export default App;
