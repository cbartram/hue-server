var express = require('express');
var router = express.Router();
const Hue = require('../Hue');
const hue = new Hue('kmJjw06quUGDF5KwxvqHOPPRPjjR5MBxFvYNhGBs', '192.168.0.100');

router.put('/lights/action/loop', (req, res) => {
    console.log(req.body.id);

    hue.getAll((data) => {
        res.json(data);
    });
});

module.exports = router;
