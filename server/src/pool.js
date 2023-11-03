/**
 * For connecting to MariaDB 
 * @Author James Zhang
 * @Since October 31, 2023
 */

const mysql = require('mysql');

const pool = mysql.createConnection({
    user:'jz75',
    host:'jz75.teaching.cs.st-andrews.ac.uk',
    database:'jz75_CS4203_D2',
    password:'.8e96x3iPGU6Q9',
});

pool.connect((err) => {
    if(err) console.error(err);
    else console.log('Database Connected!')
})

module.exports = pool;