import React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import Axios, { all } from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';

import {full_url} from './../../../Config';

// Styling 
import './Home.css';

// Components
import MessageModal from '../../modals/MessageModal/MessageModal';

function Home(props){
    const {logout, encrypt_string, decrypt_string, encrypt_key, decrypt_key} = props;

    const [loginState, setLoginState] = useState(0);

    // const [allGroups, setAllGroups] = useState([]); // List of all group objects on server 

    // const [userGroups, setUserGroups] = useState([]); // List of group objects that use is member of 

    const [groups, setGroups] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');
   
   
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const token = Cookies.get('access_token');

        if (token) {
            getGroups(token, (result) => {
                if (result){
                    setLoginState(1);
                } else {
                    setLoginState(0);
                }
            })
        } else {
            // Some stuff to handle invalid token 
        }


    }, [])

    const getGroups = async (token, callback) => {
        try {
            const res = await Axios({
                method: 'POST',
                headers : {
                    Authorization : 'Bearer ' + token 
                },
                url : full_url + '/allgroups'
            })

            const res2 = await Axios({
                method : 'POST',
                headers: {
                    Authorization : 'Bearer ' + token
                },
                data : {
                    username : Cookies.get('username')
                },
                url : full_url + '/usergroups'
            })

            let allGroups = res.data;
            let userGroups = res2.data;

            let userGroupKeys = userGroups.map((obj) => obj.id)

            allGroups.map((group) => {
                if (userGroupKeys.includes(group.id)) group.member=true;
                else group.member = false;
            })

            setGroups(allGroups);

            callback(true)
        } catch (err) { 
            console.error(err)
            callback(false)
        }
    }


    return (
        <div id='home' className='flex col align-center justify-center'>
            {loginState == 1 &&
                <button id='logout-btn' onClick={(e) => logout()}>Logout</button>
            }
            
            
            {!loginState  &&
                <div id='home-center' className='flex col align-center justify-center'>
                    <div id='signin-options' className='flex col align-center justify-center'>
                        <h2 id='signin-options-header'>Please choose sign in option</h2>
                        <Link to={'/Login'} id='home-login-btn'>Login</Link>
                        <Link to={'/Register'} id='home-register-btn'>Register</Link>
                    </div>
                </div>
            }
            {loginState == 1 &&
                <MessageModal 
                    allGroups={groups} 
                    encrypt_string={encrypt_string} 
                    decrypt_string={decrypt_string}
                    encrypt_key={encrypt_key}
                    decrypt_key={decrypt_key}
                />
            }
            
        </div>
    )
}

export default Home;