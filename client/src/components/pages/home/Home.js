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

    const [groups, setGroups] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');
   
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const token = Cookies.get('access_token');
        
        if (Cookies.get('login_state')){
            getGroups(token, (result) => {
                if (result){
                    setLoginState(1);
                } else {
                    logout()
                }
            })
        } else {
            setLoginState(0);
        }
    }, [])

    /**
     * Retrieves all groups from server database 
     * @param {*} token     : access token
     * @param {*} callback 
     */
    const getGroups = async (token, callback) => {
        try {
            // Get all groups 
            const res = await Axios({
                method: 'POST',
                withCredentials:true,
                url : full_url + '/allgroups'
            })

            // Get groups that user is a member of 
            const res2 = await Axios({
                method : 'POST',
                withCredentials:true,
                data : {
                    username : Cookies.get('username'), 
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

    /**
     * For deleting account from application 
     */
    const delete_account = async () => {
        const confirmation = window.confirm('Are you sure you want to delete you account permenantly?');

        if (confirmation) {
            try {
                const res = await Axios({
                    method:'POST',
                    withCredentials:true,
                    data : {
                        username : Cookies.get('username'),
                    },
                    url : full_url + '/deleteUser'
                })
                setErrorMsg('');
                logout();
                console.log(res.data)
            } catch (err) {
                console.log(err)
                if (err.response.status == 401){
                    navigate('/')
                } else {
                    setErrorMsg('Failure to delete account! Please logout and try again.')
                }
            }
        }
    }


    return (
        <div id='home' className='flex col align-center justify-center'>
            {loginState == 1 &&
                <div id='acc-management' className='flex row align-center justify-between'>
                    <h1 style={{color:'white', fontSize:'24px'}} >Welcome {Cookies.get('username')}</h1>
                    <div>
                        <button id='logout-btn' onClick={(e) => logout()}>Logout</button>
                        <button id='delete-account-btn' onClick={(e) => delete_account()}>Delete Account</button>
                    </div>
                    {errorMsg && <div className='error-msg'>{errorMsg}</div>}
                </div>
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
                    logout={logout}
                />
            }
            
        </div>
    )
}

export default Home;