/**
 * For executing SQL queries (prepared statements)
 * @Author James Zhang 
 * @Since October 31, 2023
 */

const pool = require('./pool.js');
const fs = require('fs/promises');


/**
 * Checks whether user already exists in database 
 * @param {*} credentials : json object {username, email}
 * @param {*} callback    : callback to return result 
 */
const validate_registration = (credentials, callback) => {
    const {username, email} = credentials; 

    let query = 'SELECT COUNT(*) FROM users WHERE email=(?) OR username=(?)';

    pool.query(query, [email, username], (err,res) => {
        callback(err, res)
    })
} 

/**
 * Adds a user to database 
 * @param {*} credentials : json object {username, email, password hash}
 * @param {*} callback    : callback to return result 
 */
const add_user = (credentials, callback) => {
    const {username, email, password} = credentials; 

    let query = "INSERT INTO users (username, email, password) VALUES (?,?,?)";

    pool.query(query, [username, email, password], (err,res) => {
        callback(err,res)
    })
}

/**
 * Returns list of all usernames in database 
 * @param {*} callback : callback to return result 
 */
const get_all_usernames = (callback) => {
    let query = 'SELECT username FROM users';

    pool.query(query, (err, res) => {
        callback(err,res)
    })
}

/**
 * Returns user data for a given username 
 * @param {*} username : username (String)
 * @param {*} callback : callback to return result
 */
const get_user = (username, callback) => {
    let query = 'SELECT * FROM users WHERE username=(?)';

    pool.query(query, [username], (err, res) => {
        callback(err, res)
    })
}

module.exports = {
    validate_registration,
    add_user,
    get_all_usernames,
    get_user
}