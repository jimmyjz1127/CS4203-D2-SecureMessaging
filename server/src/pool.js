/**
 * For connecting to MariaDB 
 * @Author James Zhang
 * @Since October 31, 2023
 */

const mysql = require('mysql');
const pool = mysql.createConnection({
    user:'jz75',
    host:'127.0.0.1',
    database:'jz75_CS4203_D2',
    password:'.8e96x3iPGU6Q9'
});

pool.connect((err) => {
    if(err) console.error(err);
    else console.log('Database Connected!')
})

module.exports=pool;