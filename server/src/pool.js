/**
 * For connecting to MariaDB 
 * @Author James Zhang
 * @Since October 31, 2023
 */

const mysql = require('mysql');

const {db_config} = require('./config');

const pool = mysql.createConnection(db_config);

pool.connect((err) => {
    if(err) console.error(err);
    else console.log('Database Connected!')
})

module.exports = pool;