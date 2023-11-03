const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


const db = require('./../database');

//dotenv
require("dotenv").config();

//generates tokens
const jwtCodes = (username, email) => {
    const data = {
        username : username,
        email : email,
    }

    const accessExpiresIn = "20000s";
    const refreshExpiresIn = "10000s";

    const accessToken = jwt.sign(data,  process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: accessExpiresIn,
        // algorithm : 'RS256'
    });
    const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: refreshExpiresIn,
        // algorithm : 'RS256'
    });

    var now = new Date();
    accessExpiryDate = new Date(now.getTime() + 2000000);
    refreshExpiryDate = new Date(now.getTime() + 1000000);

    return {
        status: 1,
        accessToken,
        refreshToken,
        accessExpiryDate,
        refreshExpiryDate,
    };
};

const generate_secret = () => {
    
}

module.exports = {
    jwtCodes,
};