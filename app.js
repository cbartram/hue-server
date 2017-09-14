const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
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


const hue = new Hue('kmJjw06quUGDF5KwxvqHOPPRPjjR5MBxFvYNhGBs', '10.0.0.129');

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

app.post('/lights/action/loop', (req, res) => {
    const ids = req.body.ids;

    if(typeof ids !== 'undefined' && ids.length > 0) {
        res.json(hue.setColorLoop(ids));
    } else {
        res.json({error: 'No "ids" array provided in body of POST Request'})
    }
});


module.exports = app;
