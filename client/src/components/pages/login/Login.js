import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import {server_port, server_url, full_url} from './../../../Config';
import './Login.css'

function Login(props) {
    const navigate = useNavigate();

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [errorMessage, setErrorMessage] = useState();

    const login = async () => {
        if (!username) setErrorMessage('Please enter username!');
        else if (!password) setErrorMessage('Please enter password!');
        else {
            try {
                const res = await Axios({
                    method:'POST',
                    withCredentials:true,
                    data:{
                        username : username,
                        password : password
                    },
                    url:full_url + '/login'
                });

                let data = res.data;

                let access_token = data.accessToken;
                let refresh_token = data.refreshToken;
                let access_token_expiry = new Date(data.accessExpiryDate)
                let refresh_token_expiry = new Date(data.refreshExpiryDate)
                let email = data.email;

                Cookies.set('access_token', access_token);
                Cookies.set('username', username);
                Cookies.set('email', email)
                Cookies.set('login_state', 1)

                navigate('/')

            } catch (err) {
                console.log(err)
                setErrorMessage(err.response.data)
            }
        }

    }

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
}

export default Login;