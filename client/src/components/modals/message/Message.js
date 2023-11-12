import React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import Axios from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFilter, faUserPlus, faPenToSquare, faRightFromBracket, faUnlock} from '@fortawesome/free-solid-svg-icons';

import {full_url} from './../../../Config';

import './Message.css';


function Message(props){
    const {message, username} = props;

    return (
        <div className='message-row'>
            {username == message.author &&
                <div className='message-wrapper flex col align-end'>
                    <p className='author'>{message.author} @ {message.datetime}</p>
                    <div className='message-bubble right'>
                        {message.content}
                    </div>
                </div>
            }
            { username != message.author && 
                <div className='message-wrapper flex col align-start'>
                    <p className='author'>{message.author} @ {message.datetime}</p>
                    <div className='message-bubble left'>
                        {message.content}
                    </div>
                </div>
            }
            
        </div>
    )
}

export default Message;