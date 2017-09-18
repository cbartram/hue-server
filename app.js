const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Hue = require('./Hue');


let app = express();


//Route Imports
const index = require('./routes/index');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//Allow CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.createConnection(`mongodb://cbartram:Swing4fence!@ds141514.mlab.com:41514/hue-database`);


const hue = new Hue('kmJjw06quUGDF5KwxvqHOPPRPjjR5MBxFvYNhGBs', '10.0.0.129');
// Marshall’s Hue: 10.0.0.20 - VaEYVOExonOd0QkHSM3TZp0hBoAtpe-sxEbG43on
// My Hue: 10.0.0.129 - kmJjw06quUGDF5KwxvqHOPPRPjjR5MBxFvYNhGBs
// Zak’s Hue 10.0.0.16 - vm5UwMtfQFno6IBQAOfZd5rlbO14wlcPn-7RfJ4A

//Routes
app.use('/lights/action/loop', index);

app.get('/', (req, res) => {
    hue.getAll((data) => {
        res.json(data);
    });
});

app.get('/lights', (req, res) => {
    hue.getLights((data) => {
        res.json(data);
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
