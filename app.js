const express = require('express');
const path = require('path');
const exec = require('exec');
const favicon = require('serve-favicon');
const logger = require('morgan');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const requestify = require('requestify');
const Hue = require('./Hue');
const passport = require('passport');
const mongoose = require('mongoose');
const Logger = require('mongodb').Logger;
const session = require('express-session');
const _ = require('lodash');
const User = require('./models/User');
require('./auth/passport')(passport);
let app = express();
const index = require('./routes/index');
const hue = new Hue(); //Hue API

//Connect to Database
mongoose.connect(`mongodb://cbartram:Swing4fence!@ds141514.mlab.com:41514/hue-database`, (err) => {
    if(err) console.log(chalk.hex('#e81a00')('Failed to Connect to the Database....Check Wifi Connection'));

});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({ secret: 'pizzafrogscelerycustomerflag', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

/**
 * Function to ensure Hue is initialized
 * before making calls to the API
 * @param res Express response object
 */
const initCheck = (res) => {
    if(!hue.isInit()) {
        console.log(chalk.red('\u2715 Philips Hue API is not initialized.'));
        res.json({success: false, msg: 'The Philips Hue API is not initialized make a POST request to /auth to initialize'});
    }
};

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
 * ------------------------------------
 * AUTHENTICATION & USER RELATED ROUTES
 * ------------------------------------
 */
//Signup Authentication Routes
app.get('/signup/failure', (req, res) => res.json({success: false, msg: 'Invalid Credentials Supplied'}));
app.post('/signup', passport.authenticate('local-signup', { failureRedirect: '/signup/failure'}), (req, res) => {
    res.json({success: true, user: req.user });
});

//Login Authentication Routes
app.get('/login/failure', (req, res) => res.json({success: false, msg: 'Invalid Credentials Supplied'}));
app.post('/login', passport.authenticate('local-login', { failureRedirect: '/login/failure' }), (req, res) => {
    //Ensure the user is setup so null values are not passed into hue
    if(!req.user.setupRequired) {
        hue.init(req.user.key, req.user.ip);
    }

    res.json({success: true, user: req.user});
});

/**
 * Verifies and Updates a user's password
 */
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
    initCheck(res);

    hue.getAll((data) => {
        res.json(data);
    });
});

app.post('/auth', (req, res) => {
  const key = req.body.key;
  const ip = req.body.ip;

  hue.init(key, ip);
  res.json({success: true, msg: 'Hue has been initialized successfully!'})
});

app.use('/lights/action/loop', index);

app.get('/lights', (req, res) => {
    //Hue has not been initialized
    if(!hue.isInit()) {
        hue.init(req.query.key, req.query.ip); //Init Hue
        hue.isInit() ? //Check again to see if it was successfull
            console.log(chalk.green('\u2713 Hue initialized successfully!')) :
            console.log(chalk.red('\u2715 Philips Hue API is not initialized.'));
    }

    hue.getLights((data) => {
        if(data !== null && typeof data !== 'undefined') {
            res.json(data);
        }
    });
});

app.get('/on', (req, res) => {
    initCheck(res);

   hue.allOn((data) => {
      res.json(data);
   });
});

app.get('/off', (req, res) => {
    initCheck(res);

    hue.allOff((data) => {
        res.json(data);
    });
});

app.get('/color/:color', (req, res) => {
    initCheck(res);

    hue.setColorAll(req.params.color, (data) => {
       res.json(data);
   });
});

app.get('/lights/:id', (req, res) => {
    initCheck(res);


    hue.getLight(req.params.id, (data) => {
      res.json(data);
   });
});

app.get('/lights/:id/color/:color', (req, res) => {
    initCheck(res);

    const id = req.params.id;
    const color = req.params.color;

    hue.setColorHex(id, color, (data) => {
        res.json(data);
    });
});

app.get('/sync', (req, res) => {
    initCheck(res);

    res.json(hue.sync());
});

app.post('/lights/:id/brightness/', (req, res) => {
    initCheck(res);

    const value = req.body.bri;

   hue.setBrightness(req.params.id, value, (data) => {
       res.json(data);
   })
});

app.post('/lights/action/brightness/', (req, res) => {
    initCheck(res);

    const value = req.body.bri;

    hue.setAllBrightness(value, (data) => {
        res.json(data);
    })
});

app.post('/lights/action/flash', (req, res) => {
    initCheck(res);

    req.body.lights.forEach(light => {
        //TODO we should be referencing the hue id (1, 2, 3) but light.id is actually referencing the Hue's unique id aa:71:b3:u8 etc...
       hue.alert(light.id, (res) => console.log(res));
    });

   res.json({success: true, lights: req.body.lights});
});

app.post('/lights/action/on', (req, res) => {
    initCheck(res);

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
    initCheck(res);

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
    initCheck(res);

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
    initCheck(res);

    const ids = req.body.ids;

    if(typeof ids !== 'undefined' && ids.length > 0) {
        res.json(hue.setColorLoop(ids));
    } else {
        res.json({error: 'No "ids" array provided in body of POST Request'})
    }
});


module.exports = app;
