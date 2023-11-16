import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";


import './Expire.css'

function Expire(props) {
    const {logout} = props;

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            logout()
            navigate('/');
        }, 5000)
    })

    return (
        <div id='expire' className='flex col align-center justify-center'>
            <h1>Your Access Token Has Expired</h1>
            <p>Logging out in 5 seconds...</p>
        </div>
    )
}

export default Expire;