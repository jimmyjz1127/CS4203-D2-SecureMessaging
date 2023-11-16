/**
 * Contains cryptographic functions for hashing data 
 * 
 * @Author : James Zhang
 * @Since  : November 5, 2023
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto-js')
const keypair = require('keypair')



module.exports = {
    bcrypt,
    crypto,
    keypair
}