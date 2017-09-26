const express = require('express');
const path = require('path');
const exec = require('exec');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const requestify = require('requestify');
const Hue = require('./Hue');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const _ = require('lodash');
const User = require('./models/User');
require('./auth/passport')(passport);
let app = express();
const index = require('./routes/index');
const hue = new Hue(); //Hue API

//Connect to Database
try {
    mongoose.connect(`mongodb://cbartram:Swing4fence!@ds141514.mlab.com:41514/hue-database`);
} catch(err) {
    console.log('Failed to Connect to the Database....Check Wifi Connection');
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({ secret: 'pizzafrogscelerycustomerflag', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

//Allow CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Marshall’s Hue: 10.0.0.20 - VaEYVOExonOd0QkHSM3TZp0hBoAtpe-sxEbG43on
// My Hue: 10.0.0.129 - kmJjw06quUGDF5KwxvqHOPPRPjjR5MBxFvYNhGBs
// Zak’s Hue 10.0.0.16 - vm5UwMtfQFno6IBQAOfZd5rlbO14wlcPn-7RfJ4A

/**
 * ----------------------
 * AUTHENTICATION ROUTES
 * ----------------------
 */
//Signup Authentication Routes
app.get('/signup/failure', (req, res) => { res.json({success: false, msg: 'Invalid Credentials Supplied'})});
app.post('/signup', passport.authenticate('local-signup', { failureRedirect: '/signup/failure'}), (req, res) => {
    res.json({success: true, user: req.user });
});

//Login Authentication Routes
app.get('/login/failure', (req, res) => { res.json({success: false, msg: 'Invalid Credentials Supplied'})});
app.post('/login', passport.authenticate('local-login', { failureRedirect: '/login/failure' }), (req, res) => {
    //Ensure the user is setup so null values are not passed into hue
    if(!req.user.setupRequired) {
        hue.init(req.user.key, req.user.ip);
    }

    res.json({success: true, user: req.user});
});


app.post('/password/update', (req, res) => {
   const currentPassword = req.body.curr;
   const newPassword = req.body.newPass;

   User.findOne({username: req.body.username.username}, (err, user) => {
       //They entered their current password in correctly
       if(user.validPassword(currentPassword)) {
           user.password = user.hash(newPassword);

           //Persist User creds
           user.save((err) => {
               if(err) {
                   console.log(err);
                   res.json({success: false, msg: 'Failed to Save User to the database'})
               }
               res.json({success: true, user});

           });

       } else {
           res.json({success: false, msg: 'Your current password does not match our records.'})
       }
   });

});


/**
 * -----------------------
 * API WIFI SCANNER ROUTES
 * -----------------------
 */
app.get('/api/v1/scan', (req, res) => {
    let data = [];

    exec(`echo preprocesor | sudo -S nmap -n -sP 10.0.0.1/24 | awk '/Nmap scan report/{printf $5;printf " ";getline;getline;print $3;}'`, (err, out) => {
        out = out.replace(/\n/g, " ").split(" ");

        out.forEach((o, v) => {
            if(v % 2 === 0 &&  typeof out[v + 1] !== 'undefined') {
                data[v] = { ip: out[v], mac: out[v + 1], primary: false };
            }
        });

        //Filter out empty data
        data = data.filter(value => Object.keys(value).length !== 0);

        //Filter out un-necessary mac address's
        data = data.filter((o) => {
           return o.mac.includes('00:17:88');
        });

        res.json({devices: data});
    });

});

//Generates a new Hue API Key
app.post('/api/v1/key/generate', (req, res) => {
    const deviceType = req.body.devicetype;//DeviceType is the ip from the client

    requestify.post(`http://${deviceType}/api/`, { devicetype: deviceType }).then((response) => {
        res.json(response.getBody());
    });
});

app.post('/api/v1/key/update', (req, res) => {
    let data = req.body.data; //User object {ip, mac, key, primary}

    //Find user in the DB
    User.findOne({username: data.username}, (err, user) => {
       if(!err) {
           //Update user creds
           user.key = data.key;
           user.ip = data.ip;
           user.setupRequired = false;
       }
       //Persist User creds
       user.save(function (err) {
            if(err) {
                console.log(err);
               res.json({success: false, msg: 'Failed to Save User to the database'})
            }
           res.json({success: true, user});

       });
    });

});

/**
 * -------------------------
 * API ROUTES FOR THE LIGHTS
 * -------------------------
 */
app.get('/', (req, res) => {
    hue.getAll((data) => {
        res.json(data);
    });
});

app.use('/lights/action/loop', index);

app.get('/lights', (req, res) => {
    hue.getLights((data) => {
        if(data !== null && typeof data !== 'undefined') {
            res.json(data);
        } else {
            res.json({});
        }
    });
});

app.get('/on', (req, res) => {
   hue.allOn((data) => {
      res.json(data);
   });
});

app.get('/off', (req, res) => {
    hue.allOff((data) => {
        res.json(data);
    });
});

app.get('/color/:color', (req, res) => {
   hue.setColorAll(req.param('color'), (data) => {
       res.json(data);
   });
});

app.get('/lights/:id', (req, res) => {
   hue.getLight(req.param('id'), (data) => {
      res.json(data);
   });
});

app.get('/lights/:id/color/:color', (req, res) => {
    const id = req.param('id');
    const color = req.param('color');

    hue.setColorHex(id, color, (data) => {
        res.json(data);
    });
});

app.get('/sync', (req, res) => {
    res.json(hue.sync());
});

app.post('/lights/:id/brightness/', (req, res) => {
   const value = req.body.bri;

   hue.setBrightness(req.param('id'), value, (data) => {
       res.json(data);
   })
});

app.post('/lights/action/brightness/', (req, res) => {
    const value = req.body.bri;

    hue.setAllBrightness(value, (data) => {
        res.json(data);
    })
});


app.post('/lights/action/on', (req, res) => {
   const ids = req.body.ids;

    if(typeof ids !== 'undefined' && ids.length > 0) {
        ids.map(id => {
           hue.on(id, () => {});
        });

        res.json({success: true});

    } else {
        res.json({error: 'No "ids" array provided in body of POST Request'})
    }
});


app.post('/lights/action/off', (req, res) => {
    const ids = req.body.ids;

    if(typeof ids !== 'undefined' && ids.length > 0) {
        ids.map(id => {
            hue.off(id, () => {});
        });

        res.json({success: true});

    } else {
        res.json({error: 'No "ids" array provided in body of POST Request'})
    }
});

app.post('/lights/action/color', (req, res) => {
    const ids = req.body.ids;
    const color = req.body.color;

    if(typeof ids !== 'undefined' && ids.length > 0) {
        ids.map(id => {
            hue.setColorHex(id, color, () => {})
        });

        res.json({success: true});

    } else {
        res.json({error: 'No "ids" array provided in body of POST Request'})
    }
});

app.post('/lights/action/loop', (req, res) => {
    const ids = req.body.ids;

    if(typeof ids !== 'undefined' && ids.length > 0) {
        res.json(hue.setColorLoop(ids));
    } else {
        res.json({error: 'No "ids" array provided in body of POST Request'})
    }
});


module.exports = app;
