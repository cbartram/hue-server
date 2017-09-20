/**
 * Created by christianbartram on 9/19/17.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


let Schema = mongoose.Schema({
    id          : Number,
    username    : String,
    password    : String,
    key         : String,
    ip          : String,
});

// methods ======================
// generating a hash
Schema.methods.hash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
Schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', Schema);
