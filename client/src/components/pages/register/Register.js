import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import {server_port, server_url, full_url} from './../../../Config';
import './Register.css'


function Register(props) {
    const navigate = useNavigate();

    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [errorMessage, setErrorMessage] = useState();

    const validatePassword = () => {
        if (!password) {return false;}
        else if (password.length < 16){return false;} 
        else if (!(/[0-9]/.test(password))) {return false;}
        else if (!(/[A-Z]/.test(password))) {return false;}
        else if (!(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))) {return false;}
        return true;
    }

    const validateEmail = () => {
        const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!email){return false;} 
        else if (!emailPattern.test(email)){return false;} 
        return true;
    }

    const validateUsername = () => {
        const usernamePattern = /^[A-Za-z0-9._]+$/;

        if (!username){return false}
        else if (!usernamePattern.test(username)) {return false;}
        return true;
    }

    const register = async () => {
        if (!validateEmail()) {setErrorMessage('Please check email!');}
        else if (!validateUsername()) {setErrorMessage('Please check username!');}
        else if (!validatePassword()) {setErrorMessage('Please check password!')}
        else {
            try{
                const res = await Axios({
                    method:'POST',
                    withCredentials:true,
                    data:{
                        username:username, 
                        email:email,
                        password:password
                    },
                    url:full_url + '/register'
                })
                let data = res.data;

                let access_token = data.accessToken;
                let refresh_token = data.refreshToken;
                let access_token_expiry = new Date(data.accessExpiryDate)
                let refresh_token_expiry = new Date(data.refreshExpiryDate)

                Cookies.set('access_token', access_token);
                Cookies.set('username', username);
                Cookies.set('email', data.email);
                Cookies.set('login_state', 1)

                navigate('/');
            } catch (err) {
                console.log(err);
                setErrorMessage(err.response.data);
            }
        }
    }
  
    return (
        <div id='register' className='flex col align-center justify-center'>
            <div id="register-center" className='flex col align-center justify-center'>
                <h1 id='register-header'>Register Account</h1>

                <div id='register-error'>{errorMessage}</div>

                <input 
                    className='register-text' 
                    type='email' 
                    placeholder='Enter email...'
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input 
                    className='register-text' 
                    type='text' 
                    placeholder='Enter username...'
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input 
                    className='register-text' 
                    type='password' 
                    placeholder='Enter password...'
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button id='register-btn' onClick={(e) => register()}>Register</button>
            </div>
        </div>
    )
}

export default Register;