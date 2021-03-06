import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import Signup from './components/register/Signup';
import Login from './components/login/Login';
import Setup from './components/setup/Setup';
import Profile from './components/profile/Profile';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

/**
 * Dynamically Updates the route to /login if the user is not
 * currently authenticated
 */
function isLoggedIn() {const user = JSON.parse(sessionStorage.getItem('user')); return !(user === null || typeof user === 'undefined') }

ReactDOM.render(
   <MuiThemeProvider>
        <BrowserRouter>
            <div>
                <Route exact path="/" component={App}/>
                <Route path="/signup" render={() =>(isLoggedIn() ? (<Redirect to="/"/>) : (<Signup/>))} />
                <Route path="/login" render={() =>(isLoggedIn() ? (<Redirect to="/"/>) : (<Login/>))} />

                {/* Authentication Route Middleware */}
                <Route exact path="/setup" render={() =>(!isLoggedIn() ? (<Redirect to="/login"/>) : (<Setup/>))}/>
                <Route exact path="/profile" render={() => !isLoggedIn() ? (<Redirect to="/login"/>) : (<Profile/>)}/>
            </div>
        </BrowserRouter>
   </MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
