import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import {server_port, server_url, full_url} from './../../../Config';
import './Register.css'

// Assets 
import LoadingIcon from './../../../assets/loading.gif';


function Register(props) {
    const {bcrypt, decrypt_string, encrypt_string, generateKeyPair, encrypt_key} = props;

    const navigate = useNavigate();

    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [errorMessage, setErrorMessage] = useState();

    const [loading, setLoading] = useState(0);

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
                setLoading(1);

                const salt = bcrypt.genSaltSync(10);
                let {public_key, private_key} = generateKeyPair();

                // encrypt private key (symetrically) with password before sending to server for storage 
                let encrypted_private_key = encrypt_key(private_key, password); 

                const res = await Axios({
                    method:'POST',
                    withCredentials:true,
                    data:{
                        username:username, 
                        email:email,
                        password:bcrypt.hashSync(password, salt),
                        salt : salt,
                        public_key:public_key,
                        private_key:encrypted_private_key
                    },
                    url:full_url + '/register'
                })
                setPassword(null);

                let data = res.data;

                Cookies.set('username', username, {secure:true, sameSite:'Strict'});
                Cookies.set('email', data.email, {secure:true, sameSite:'Strict'});
                Cookies.set('login_state', 1, {secure:true, sameSite:'Strict'})
                Cookies.set('private_key', encrypted_private_key, {secure:true, sameSite:'Strict'});
                Cookies.set('public_key', public_key, {secure:true, sameSite:'Strict'});

                navigate('/');
            } catch (err) {
                console.log(err);
                setErrorMessage(err.response.data);
            }
        }
        setLoading(0);
    }
  
    if (!loading) {    
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
    } else {
        return (
            <div id='register' className='flex col align-center justify-center'>
                <img id='login-loading' src={LoadingIcon}/>
                <h1 style={{'color' : 'white'}}>Registering new user...</h1>
            </div>
        )
    }
}

export default Register;