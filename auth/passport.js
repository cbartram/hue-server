/**
 * Created by christianbartram on 9/19/17.
 */
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.js');

module.exports = (passport) => {

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        User.findOne({username: user.username}, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        (req, username, password, done) => {
            process.nextTick(function() {

                User.findOne({username: username}, (err, user) => {
                   if(err) { return done(err) }

                   if(user) {
                       return done(null, false, {message: 'That username is already taken'})
                   }

                });

                // create the user
                let newUser = new User();

                newUser.username = username;
                newUser.password = newUser.hash(password);
                newUser.key = null;
                newUser.ip = null;
                newUser.setupRequired = true;


                // save the user
                newUser.save(function (err) {
                    if(err) {
                        console.log(err);
                        return done(null, false, { message: 'Failed to save information to the database.' })
                    }
                    return done(null, newUser);
                });
            });

        }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done) => {

        User.findOne({ username: username }, (err, user) => {
            if (err) { return done(err); }

            if (user === null || typeof user === 'undefined') {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            req.login(user, function(err) {
                if (err) done(err);

                return done(null, user);
            });

        });

    }));

};