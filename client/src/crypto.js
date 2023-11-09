/**
 * Contains cryptographic functions for hashing data 
 * 
 * @Author : James Zhang
 * @Since  : November 5, 2023
 */

const bcrypt = require('bcryptjs');
const elliptic = require('elliptic')
const crypto = require('crypto-js')


module.exports = {
    bcrypt,
    elliptic,
    crypto
}