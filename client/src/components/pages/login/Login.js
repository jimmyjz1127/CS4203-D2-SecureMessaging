import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import {genSaltSync, hashSync} from 'bcryptjs'

import {server_port, server_url, full_url} from './../../../Config';
import './Login.css'

import LoadingIcon from './../../../assets/loading.gif';

function Login(props) {
    const {encrypt_string, decrypt_string} = props;

    const navigate = useNavigate();

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [errorMessage, setErrorMessage] = useState();

    const [loading, setLoading] = useState(0);

    const login = async () => {
        if (!username) setErrorMessage('Please enter username!');
        else if (!password) setErrorMessage('Please enter password!');
        else {
            setLoading(1);
            try {
                // Retrieve user's salt from server database
                const response = await Axios({
                    method:'POST',
                    withCredentials:true,
                    data : {
                        username : username
                    },
                    url : full_url + '/salt'
                })

                // the salt originally used to hash password before transmission to server 
                let salt = response.data.salt; 

                const res = await Axios({
                    method:'POST',
                    withCredentials:true,
                    data:{
                        username : username,
                        password : hashSync(password, salt) // generate original password hash from registration
                    },
                    url:full_url + '/login'
                });

                setPassword(null); // get rid of password from browser

                let data = res.data;

                let private_key = data.private_key;
                let public_key = data.public_key;
                let email = data.email;

                Cookies.set('username', username, {secure:true, sameSite:'Strict'});
                Cookies.set('email', email, {secure:true, sameSite:'Strict'})
                Cookies.set('private_key', private_key, {secure:true, sameSite:'Strict'})
                Cookies.set('public_key', public_key, {secure:true, sameSite:'Strict'})
                Cookies.set('login_state', 1, {secure:true, sameSite:'Strict'})

                navigate('/')

            } catch (err) {
                console.log(err)
                // setErrorMessage(err.response.data)
            }
            setLoading(0)
        }

    }

    if (!loading) {
        return (
            <div id='login' className='flex col align-center justify-center'>
                <div id='login-center' className='flex col align-center justify-center'>
                    <h1 id="login-header">Login</h1>

                    <div id='login-error'>{errorMessage}</div>

                    <input 
                        id='login-username' 
                        className='login-text' 
                        type='text' 
                        placeholder='Username...' 
                        onChange={(e) => setUsername(e.target.value)} 
                    />

                    <input 
                        id='login-password' 
                        className='login-text' 
                        type='password' 
                        placeholder='Password...' 
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button id='login-btn' onClick={(e) => login()}>Login</button>

                </div>
            </div>
        )
    } else {
        return (
            <div id='login' className='flex col align-center justify-center'>
                <img id='login-loading' src={LoadingIcon}/>
                <h1 style={{'color':'white'}}>Logging in...</h1>
            </div>
        )
    }
}

export default Login;