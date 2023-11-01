/**
 * Server entry point 
 * @Author James Zhang
 * @Since Oct 31, 2023
 */


const express = require('express');
const bodyParser = require('body-parser');
const {urlencoded} = require('express')


const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

const server_port = 5050;

app.use()

app.listen(server_port, ()=>{
    console.log(`Server started on port ${server_port}`);
})