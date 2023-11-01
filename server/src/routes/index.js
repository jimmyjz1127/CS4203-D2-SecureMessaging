/**
 * Contains routes for handling <>
 * 
 * @Author James Zhang
 * @Since November 1, 2023
 */


var express = require("express");
var router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require('./../database');

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

router.post('/register', async (req,res) => {
    try {

    } catch (err) {
        console.error(err)
    }
})

router.post('/login', async (req,res) => {

})