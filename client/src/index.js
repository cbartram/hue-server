import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import Signup from './components/Signup';
import Login from './components/Login';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';





ReactDOM.render(
   <MuiThemeProvider>
        <BrowserRouter>
            <div>
                <Route exact path="/" component={App}/>
                <Route path="/signup" component={Signup} />
                <Route path="/login" component={Login} />
            </div>
        </BrowserRouter>
   </MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
