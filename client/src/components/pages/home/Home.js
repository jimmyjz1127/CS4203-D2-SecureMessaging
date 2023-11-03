import React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import Axios from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';


// Styling 
import './Home.css';

// Components

function Home(props){
    const {logout} = props;

    const navigate = useNavigate();

    const login_state = Cookies.get('login_state')

    useLayoutEffect(() => {
        // implement authenticated message retrieval
    }, [])

    return (
        <div id='home' className='flex col align-center justify-center'>
            {login_state == 1 &&
                <button id='logout-btn' onClick={(e) => logout()}>Logout</button>
            }
            
            <div id='home-center' className='flex col align-center justify-center'>
                {!login_state  &&
                    <div id='signin-options' className='flex col align-center justify-center'>
                        <h2 id='signin-options-header'>Please choose sign in option</h2>
                        <Link to={'/Login'} id='home-login-btn'>Login</Link>
                        <Link to={'/Register'} id='home-register-btn'>Register</Link>
                    </div>
                }
                {login_state == 1 &&
                    <div id='chat-wrapper'>
                        <h1>Welcome</h1>
                    </div>
                }
            </div>
        </div>
    )
}

export default Home;