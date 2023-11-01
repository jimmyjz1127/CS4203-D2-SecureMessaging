/**
 * Contains routes for handling <>
 * 
 * @Author James Zhang
 * @Since November 1, 2023
 */


const express = require("express");
var router = express.Router();

const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const db = require('./../database');
const jwtTokens = require('./../authentication/token');
const authentication = require('./../authentication/authentication');

//####################################
// Helper Functions 
//####################################

/**
 * For decoding token 
 * @param {*} token 
 * @returns 
 */
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};



//###################################
// Router Handlers 
//###################################

/**
 * Handles registering new user : 
 * 1) Checks if username/email already exists 
 * 2) Stores user credentials with hashed password in database 
 * 3) Creates access token based on user credentials and sends tokens back to user 
 * 
 * Arguments:
 *      req.body = {username, email, password}
 */
router.post('/register', async (req,res) => {
    const {email, username, password} = req.body;

    try {
        db.validate_registration(req.body, (err, res) => {
            if (err) {
                res.status(500).send('Error : please try again')
            } else if (!res) {
                res.status(500).send('Error : username or email already taken');
            } else {
                // Hash password
                const password_hash = bcrypt.hash(password, 16)

                const credentials = {
                    username : username,
                    email : email,
                    password : password_hash
                }

                db.add_user(credentials, (err2, res2) => {
                    if (err2) {res.status(500).send('Error : please try again')} 
                    else {
                        let tokens = jwtTokens.jwtTokens(username, email); // generate refresh and access token
                        res.json(tokens) // send refresh and access token back to user
                    }
                })
            }
        })
    } catch (err) {
        console.error(err)
    }
})

router.post('/login', async (req,res) => {

})