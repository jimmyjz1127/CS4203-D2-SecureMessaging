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

const {client_port, client_url, full_url} = require('./../config')

//####################################
// Middleware
//####################################
const origins = [
    "http://localhost:" + client_port,
    "http://127.0.0.1:" + client_port
];

router.use(
    cors({
        origin: origins,
        credentials: true,
    })
);


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
    console.log('POST : /register')

    const {email, username, password, salt} = req.body;

    try {
        db.validate_registration(req.body, async (err, res1) => {
            if (err) {
                res.status(500).send('Error : please try again')
            } else if (!res1) {
                res.status(500).send('Error : username or email already taken');
            } else {
                // Hash password
                const password_hash = await bcrypt.hash(password, 16)

                const credentials = {
                    username : username,
                    email : email,
                    password : password_hash,
                    salt:salt
                }

                db.add_user(credentials, (err2, res2) => {
                    if (err2) {
                        console.log(err2)
                        res.status(500).send('Error : please try again')
                    } 
                    else {
                        let tokens = jwtTokens.jwtCodes(username, email); // generate refresh and access token
                        res.json(tokens) // send refresh and access token back to user
                    }
                })
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Invalid credentials, please try again!')
    }
})

/**
 * Route handler for login request 
 * 1) Checks if username exists 
 * 2) Checks password hashes 
 * 3) returns user data to client on success
 */
router.post('/login', async (req,res) => {
    console.log('POST : /login')

    try{
        const {username, password} = req.body;

        db.get_user(username, async (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Check Username!');
            } else {
                if (result.length == 0) {
                    res.status(500).send('Check Username!');
                } else{

                    // Compare password hashes 
                    if (await bcrypt.compareSync(password,result[0].password)){
                        let tokens = jwtTokens.jwtCodes(
                            result[0].username,
                            result[0].email,
                        )

                        tokens['username'] = username;
                        tokens['email'] = result[0].email;

                        res.json(tokens)
                    } else {
                        res.status(500).send('Check Password!')
                    }
                }
            }
        })
    } catch (err) {
        console.error(err)
    }
})

/**
 * Retrieves salt value for a user
 */
router.post('/salt', async (req,res) => {
    console.log('GET : /salt');

    const {username} = req.body;

    try {
        db.get_salt(username, (err,result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Failed to retrieve salt, please check username');
            } else{
                res.status(200).send(result[0])
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).send('Failed to retrieve salt, please check username');
    }
})

module.exports = router;