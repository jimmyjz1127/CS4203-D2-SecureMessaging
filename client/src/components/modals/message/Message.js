import React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import Axios from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';

import {full_url} from './../../../Config';

import './Message.css';


function Message(props){
    const {message, username, delete_message} = props;

    const accept_request = async (author) => {
        try {
            const res = await Axios({
                method : 'POST',
                withCredentials:true,
                data: { 
                    username : author,
                    group_id : message.group_id,
                },
                url : full_url + '/joinGroup'
            })
            delete_message(author, message.group_id);
        } catch (err) {
            console.log(err)
        }
    }

    if (message.type == 1) {
        return (
            <div className='message-row'>
                <div className='message-wrapper flex col align-start'>
                    <p className='author'>{message.author} @ {message.datetime}</p>
                    <div className='message-bubble left'>
                        <div style={{fontSize:'0.8em'}}>{message.author} has requested to join group.</div>
                        <div>
                            <button className="request-btn" onClick={(e) => accept_request(message.author)}>Accept</button>
                            <button className='request-btn' onClick={(e) => delete_message(message.author, message.group_id)}>Decline</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
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
    
}

export default Message;