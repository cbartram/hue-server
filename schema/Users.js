/**
 * Created by christianbartram on 9/17/17.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create a new Schema
let userSchema = new Schema({
    id: Integer,
    username: String,
    key: String,
    ip: String
});

module.exports = mongoose.model(`User`, userSchema);