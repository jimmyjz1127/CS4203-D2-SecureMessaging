/**
 * For executing SQL queries (prepared statements)
 * @Author James Zhang 
 * @Since October 31, 2023
 */

const pool = require('./pool.js');
const fs = require('fs/promises');



const validate_registration = (credentials, callback) => {
    const {username, email} = credentials; 

    let query = 'SELECT COUNT(*) FROM users WHERE email=(?) OR username=(?)';

    pool.query(query, [email, username], (err,res) => {
        callback(err, res)
    })
} 

const add_user = (credentials, callback) => {
    const {username, email, password_hash} = credentials; 

    let query = "INSERT INTO users VALUES (?,?,?)";

    pool.query(query, [username, email, password_hash], (err,res) => {
        callback(err,res)
    })
}