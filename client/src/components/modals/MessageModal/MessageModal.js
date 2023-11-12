import React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import Axios from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFilter, faUserPlus, faPenToSquare, faRightFromBracket, faUnlock} from '@fortawesome/free-solid-svg-icons';


import Message from './../message/Message';

import {full_url} from './../../../Config';

import './MessageModal.css';


function MessageModal(props) {
    const {allGroups, encrypt_string, decrypt_string, encrypt_key, decrypt_key} = props;

    const username = Cookies.get('username')

    /**
     * 0 : Create Group 
     * 1 : Password prompt to enter group 
     * 2 : Messages 
     * 3 : Join Request 
     */
    const [type, setType] = useState(0); // set to 0 if no groups 

    const [groups, setGroups] = useState(allGroups);

    const [selectedGroup, setSelectedGroup] = useState();

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState('Test Message');

    const [password, setPassword] = useState([]);

    /**
     * Toggles group listing (left panel) between all groups and groups that user is apart of 
     * @param {*} event 
     */
    const changeGroupListing = (event) => {
        if (event.target.checked) {
            let filtered_groups = groups.map((group) => {
                if (group.member) return group
            })
            setGroups(filtered_groups)
        }else {
            setGroups(allGroups)
        }
        
    }

    const selectGroup = (event, group) => {
        if (group.id != selectGroup.id){
            if (group.member) {
                setType(1);
                setSelectedGroup(group);
            } else {
                setType(3)
                setSelectedGroup(group);
            }
            setMessage('');
            setMessages([])
        } 
    }



    /**
     * Returns messages of group, encrypted for particular user 
     * @param {*} group_id 
     * @returns 
     */
    const retrieveMessages = async (group_id) => {
        try {
            const res = await Axios({
                method : 'POST',
                headers: {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data : {
                    username : username,
                    group_id : group_id
                },
                url : full_url + '/getMessages'
            })

            let data = res.data; 

            let encrypted_private_key = Cookies.get('private_key');

            let private_key = decrypt_key(encrypted_private_key, password);
            
            const decrypted_messages = data.map((message) => {
                let decrypted = decrypt_string(message.content, private_key);
                console.log(decrypted)
                let x = {
                    id : message.id,
                    author:message.author,
                    datetime:message.datetime,
                    content:decrypted,
                    key_user:message.key_user
                }
                return x
            })

            private_key = null; //throw away private key after use 

            setPassword(null) // throw away password after use 

            setMessages(decrypted_messages);

            setType(2);
        
        } catch (err) {
            console.log(err);
            // some error message 
        }
    }


    const sendMessage = async () => {
        try {
            let date = new Date().toLocaleString();

            // Retrieve public keys of all members in group to encrypt message 
            const res = await Axios({
                method:'POST',
                headers: {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data : {
                    username : username,
                    group_id : selectedGroup.id
                },
                url: full_url + '/getGroupKeys'
            })

            let data = res.data;
            
            // Created an encrypted copy of message for each members public key
            let encrypted_copies = data.map((obj) => {     
                let encrypted = encrypt_string(message, obj.public_key);    
   
                return {
                    author : username, 
                    content : encrypted,
                    group_id : selectedGroup.id,
                    key_user : obj.username,
                    datetime : date
                }
            })

            // Send encrypted copies to server for storage 
            const response = await Axios({
                method:'POST',
                headers: {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data: {
                    messages : encrypted_copies
                },
                url : full_url + '/sendMessage'
            })
            response.data[0].content = message;

            setMessages(messages => [...messages, response.data[0]]);

            setMessage('');

        } catch(err) {
            console.log(err);
            // do something to indicate 
        }
    }

    const createGroup = async (id) => {
        let name = document.getElementById(id).value;

        let datetime = new Date().toLocaleString();

        try {
            const res = await Axios({
                method: 'POST', 
                headers : {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data : {
                    name : name,
                    username : username, 
                    datetime: datetime
                },
                url: full_url + '/addGroup'
            })
            
            setGroups(groups => [...groups, res.data]);

        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div id='message-modal' className='flex row'>
            <div id='left-col'>
                <div id='left-menu-bar' className='flex row align-center'>
                    <button id='create-group-btn' onClick={(e) => setType(0)}>
                        <FontAwesomeIcon icon={faPenToSquare}/>
                    </button>

                    <div className="flex row align-center" style={{backgroundColor:'var(--bg-color-dark)', borderRadius:'var(--border-radius-m)', padding:'5px', height:'50%'}}>
                        <input id='all-groups-check' type='checkbox' onClick={(e) => changeGroupListing(e)}/>
                        <label style={{fontSize:'12px'}}>Show Only Your Groups</label>
                    </div>
                </div>

                <div id='groups'>
                    {
                        groups.map((group) => {
                            if (group && group.member){
                                return (
                                    <div className='btn member-tile group-tile flex row align-center justify-between' onClick={(e) => selectGroup(e, group)}>
                                        <h4>{group.name}</h4>
                                    </div>
                                )
                            } else if (group){
                                return (
                                    <div className='btn group-tile flex row align-center justify-between' onClick={(e) => selectGroup(e, group)}>
                                        <h4>{group.name}</h4>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>

            {type == 0 &&
                <div id="right-col" className='password-prompt flex col align-center justify-center'>
                    <div id='create-group-form'>
                        <h1>Create Group</h1>
                        <input type='text' placeholder='Enter group name...' id='create-group-input'/>
                        <button id='create-group' onClick={(e) => createGroup('create-group-input')}>Create</button>
                    </div>
                </div>
            }

            {type == 1 && 
                <div id="right-col" className='password-prompt flex col align-center justify-center'>
                    <h2 style={{color:'white'}}>Enter password to decrypt messages.</h2>
                    <input id='decrypt-input' type='password' placeholder='Enter password...' onChange={(e) => setPassword(e.target.value)}/>
                    <button id='decrypt-btn' onClick={(e) => retrieveMessages(selectedGroup.id)}>Decrypt Messages</button>
                </div>

            }

            
            {type == 2 &&
                <div id='right-col'>
                    <div id='right-menu-bar' className='flex col align-center justify-center'>
                        <div id='message-panel-bar' className='flex row align-center justify-between'>
                            <h1 style={{color:'white'}}>{selectedGroup.name}</h1>

                            <div className='flex row align-center'>
                                <div className='dropdown'>
                                    <button id="add-member-btn" className='message-btn'>
                                        <FontAwesomeIcon icon={faUserPlus}/>
                                    </button>
                                </div>

                                <button id='leave-group-btn' className='message-btn'>
                                    <FontAwesomeIcon icon={faRightFromBracket}/>
                                </button>
                                <button id='view-members-btn' className='message-btn'>Members</button>
                            </div>
                            
                        </div>
                    </div>
                    <div id='message-section'>
                        {
                            messages.map((message) => {
                                return (
                                    <Message message={message} username={username}/>
                                )
                            })
                        }
                    </div>
                    <div id='type-message-container' className='flex col align-center justify-center'>
                        <div id='type-message-bar' className='flex row align-center'>
                            <input id='message-input' type='text' value={message} placeholder='Type a message...' onChange={(e) => setMessage(e.target.value)}/>
                            <button id='send-msg-btn' onClick={(e) => sendMessage()}>Send</button>
                        </div>
                    </div>
                </div>
            }   

            {type == 3 && 
                <div>
                    <h1>TesT</h1>
                </div> 
            }
            
        </div>
    )
}

export default MessageModal;